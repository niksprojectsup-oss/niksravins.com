import { getServerSession } from "@/lib/auth/session";
import { isAdminSessionActive } from "@/lib/auth/admin-repository";
import { authorizeCmsImageUpload } from "@/lib/cms/cms-image-upload-auth";
import { getCmsImageStorageProvider } from "@/lib/cms/image-storage";
import { validateCmsImageUpload } from "@/lib/cms/image-storage/validation";

export async function POST(request: Request) {
  const session = await getServerSession();
  let sessionActive: boolean | "unavailable" = false;

  if (session?.role === "ADMIN" && session.mfaVerified) {
    try {
      sessionActive = await isAdminSessionActive(session.sessionId);
    } catch {
      sessionActive = "unavailable";
    }
  }

  const auth = authorizeCmsImageUpload({ session, sessionActive });
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing image file." }, { status: 400 });
  }

  const validation = validateCmsImageUpload({
    size: file.size,
    mimeType: file.type,
  });

  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const provider = getCmsImageStorageProvider();

  try {
    const uploaded = await provider.uploadImage({
      buffer,
      mimeType: file.type,
      size: file.size,
      extension: validation.extension,
    });

    return Response.json(uploaded);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
