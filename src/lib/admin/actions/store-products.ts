"use server";

import type { StoreProductStatus, StoreProductType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import {
  createStoreProduct,
  getStoreProductRecordById,
  updateStoreProduct,
} from "@/lib/store/product-repository";
import { DEFAULT_LICENSE_NOTICE } from "@/lib/store/types";
import { logAuditEvent } from "@/lib/security/audit";
import { prisma, requireDatabase } from "@/lib/db/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseProductType(value: string): StoreProductType | null {
  if (
    value === "SESSION" ||
    value === "VIDEO" ||
    value === "MEDITATION" ||
    value === "COURSE"
  ) {
    return value;
  }
  return null;
}

function parseProductStatus(value: string): StoreProductStatus | null {
  if (value === "DRAFT" || value === "PUBLISHED") {
    return value;
  }
  return null;
}

function parseStoreProductForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const productType = parseProductType(String(formData.get("productType") ?? ""));
  const status = parseProductStatus(String(formData.get("status") ?? "DRAFT"));
  const priceEuros = Number(formData.get("priceEuros"));
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const contentKey = String(formData.get("contentKey") ?? "").trim();
  const contentMimeType = String(formData.get("contentMimeType") ?? "").trim();
  const contentDurationRaw = String(formData.get("contentDurationSeconds") ?? "").trim();
  const contentDurationSeconds = contentDurationRaw ? Number(contentDurationRaw) : null;
  const bookableOfferId = String(formData.get("bookableOfferId") ?? "").trim();
  const licenseNotice = String(formData.get("licenseNotice") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!title) return { error: "Title is required." as const };
  if (!description || description.length < 10) {
    return { error: "Description must be at least 10 characters." as const };
  }
  if (!productType) return { error: "Select a valid product type." as const };
  if (!status) return { error: "Select a valid status." as const };
  if (!Number.isFinite(priceEuros) || priceEuros < 0) {
    return { error: "Price must be zero or greater." as const };
  }

  const slug = slugInput || slugify(title);
  if (!slug) return { error: "Slug is required." as const };

  return {
    data: {
      slug,
      title,
      description,
      productType,
      priceCents: Math.round(priceEuros * 100),
      currency: "EUR",
      status,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      thumbnailUrl: thumbnailUrl || null,
      contentKey: contentKey || null,
      contentMimeType: contentMimeType || null,
      contentDurationSeconds:
        contentDurationSeconds && contentDurationSeconds > 0
          ? contentDurationSeconds
          : null,
      bookableOfferId: bookableOfferId || null,
      licenseNotice: licenseNotice || DEFAULT_LICENSE_NOTICE,
    },
  };
}

async function slugInUse(slug: string, excludeId?: string): Promise<boolean> {
  requireDatabase();
  const existing = await prisma.storeProduct.findUnique({ where: { slug } });
  if (!existing) return false;
  return existing.id !== excludeId;
}

export async function createStoreProductAction(formData: FormData) {
  const session = await requireAdmin();
  const parsed = parseStoreProductForm(formData);
  if ("error" in parsed) return parsed;

  if (await slugInUse(parsed.data.slug)) {
    return { error: "A product with this slug already exists. Choose a different title or slug." };
  }

  const product = await createStoreProduct(parsed.data);

  await logAuditEvent({
    action: "store_product.create",
    resource: "store_product",
    resourceId: product.id,
    actorAdminId: session.id,
    actorRole: session.role,
  });

  revalidatePath("/admin/store");
  revalidatePath("/client/store");
  redirect("/admin/store");
}

export async function updateStoreProductAction(id: string, formData: FormData) {
  const session = await requireAdmin();
  const existing = await getStoreProductRecordById(id);
  if (!existing) return { error: "Product not found." };

  const parsed = parseStoreProductForm(formData);
  if ("error" in parsed) return parsed;

  if (parsed.data.slug !== existing.slug && (await slugInUse(parsed.data.slug, id))) {
    return { error: "Another product already uses this slug." };
  }

  await updateStoreProduct(id, parsed.data);

  await logAuditEvent({
    action: "store_product.update",
    resource: "store_product",
    resourceId: id,
    actorAdminId: session.id,
    actorRole: session.role,
  });

  revalidatePath("/admin/store");
  revalidatePath("/client/store");
  revalidatePath("/client/purchases");
  redirect("/admin/store");
}
