import { NextResponse } from "next/server";
import { isClientAuthSessionActive } from "@/lib/auth/client-repository";
import { getServerSession } from "@/lib/auth/session";
import { canAccessStoreContent } from "@/lib/store/access";
import { openStoreContent } from "@/lib/store/content/open-content";
import type { StoreContentRange } from "@/lib/store/content/types";
import { getStoreProductById } from "@/lib/store/product-repository";
import { getClientPurchaseForProduct } from "@/lib/store/purchase-repository";

type RouteParams = {
  params: Promise<{ productId: string }>;
};

async function requireAuthenticatedClient() {
  const session = await getServerSession();
  if (!session || session.role !== "CLIENT" || !session.clientId) {
    return null;
  }

  const active = await isClientAuthSessionActive(session.sessionId);
  if (!active) return null;

  return session;
}

function parseRangeHeader(rangeHeader: string, size: number): StoreContentRange | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;

  const start = match[1] ? Number.parseInt(match[1], 10) : 0;
  const end = match[2] ? Number.parseInt(match[2], 10) : size - 1;

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= size) {
    return null;
  }

  return { start, end };
}

export async function GET(request: Request, { params }: RouteParams) {
  const session = await requireAuthenticatedClient();
  if (!session?.clientId) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  const { productId } = await params;
  const [product, purchase] = await Promise.all([
    getStoreProductById(productId),
    getClientPurchaseForProduct(session.clientId, productId),
  ]);

  const access = canAccessStoreContent({
    authenticatedClientId: session.clientId,
    productId,
    product,
    purchase,
  });

  if (!access.allowed) {
    return NextResponse.json({ error: access.reason }, { status: 403 });
  }

  try {
    const rangeHeader = request.headers.get("range");
    const commonHeaders = {
      "Content-Type": access.ref.mimeType,
      "Accept-Ranges": "bytes",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "Vary": "Cookie",
      "X-Content-Type-Options": "nosniff",
    };

    if (rangeHeader) {
      const probe = await openStoreContent(access.ref);
      const range = parseRangeHeader(rangeHeader, probe.totalSize);

      if (!range) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${probe.totalSize}` },
        });
      }

      const content = await openStoreContent(access.ref, range);
      const chunkSize = range.end - range.start + 1;

      return new NextResponse(content.body, {
        status: 206,
        headers: {
          ...commonHeaders,
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${range.start}-${range.end}/${content.totalSize}`,
        },
      });
    }

    const content = await openStoreContent(access.ref);

    return new NextResponse(content.body, {
      status: 200,
      headers: {
        ...commonHeaders,
        "Content-Length": String(content.totalSize),
      },
    });
  } catch (error) {
    console.error("[store] content stream failed:", error);
    return NextResponse.json({ error: "Content unavailable." }, { status: 404 });
  }
}
