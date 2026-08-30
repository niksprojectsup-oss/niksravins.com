"use server";

import type { OfferType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import {
  createOffer,
  formatPriceLabel,
  getOfferRecordById,
  updateOffer,
} from "@/lib/booking/offer-repository";
import { logAuditEvent } from "@/lib/security/audit";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseOfferType(value: string): OfferType | null {
  if (value === "SINGLE_SESSION" || value === "PACKAGE" || value === "COURSE") {
    return value;
  }
  return null;
}

function parseOfferForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const offerType = parseOfferType(String(formData.get("offerType") ?? ""));
  const priceEuros = Number(formData.get("priceEuros"));
  const durationMinutes = Number(formData.get("durationMinutes"));
  const durationLabel = String(formData.get("durationLabel") ?? "").trim();
  const priceLabel = String(formData.get("priceLabel") ?? "").trim();
  const checkoutNote = String(formData.get("checkoutNote") ?? "").trim();
  const packageSessionsRaw = String(formData.get("packageSessions") ?? "").trim();
  const packageSessions = packageSessionsRaw ? Number(packageSessionsRaw) : null;
  const requiresStartDate = formData.get("requiresStartDate") === "on";
  const active = formData.get("active") === "on";
  const published = formData.get("published") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const bonuses = String(formData.get("bonuses") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!title) return { error: "Title is required." as const };
  if (!description || description.length < 10) {
    return { error: "Description must be at least 10 characters." as const };
  }
  if (!offerType) return { error: "Select a valid offer type." as const };
  if (!Number.isFinite(priceEuros) || priceEuros < 0) {
    return { error: "Price must be zero or greater." as const };
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { error: "Duration must be greater than zero." as const };
  }

  const slug = slugInput || slugify(title);
  if (!slug) return { error: "Slug is required." as const };

  const priceCents = Math.round(priceEuros * 100);
  const currency = "EUR";

  return {
    data: {
      slug,
      title,
      description,
      detail,
      offerType,
      priceCents,
      currency,
      durationMinutes,
      durationLabel: durationLabel || null,
      priceLabel: priceLabel || formatPriceLabel(priceCents, currency),
      checkoutNote: checkoutNote || null,
      highlights,
      bonuses,
      packageSessions:
        offerType === "PACKAGE" && packageSessions && packageSessions > 0
          ? packageSessions
          : null,
      requiresStartDate,
      active,
      published,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  };
}

export async function createOfferAction(formData: FormData) {
  const session = await requireAdmin();
  const parsed = parseOfferForm(formData);
  if ("error" in parsed) return parsed;

  const id = parsed.data.slug;
  const existing = await getOfferRecordById(id);
  if (existing) {
    return { error: "An offer with this slug already exists. Choose a different title or slug." };
  }

  await createOffer({ id, ...parsed.data });

  await logAuditEvent({
    action: "offer.create",
    resource: "bookable_offer",
    resourceId: id,
    actorAdminId: session.id,
    actorRole: session.role,
  });

  revalidatePath("/admin/packages");
  revalidatePath("/book");
  redirect("/admin/packages");
}

export async function updateOfferAction(id: string, formData: FormData) {
  const session = await requireAdmin();
  const existing = await getOfferRecordById(id);
  if (!existing) return { error: "Offer not found." };

  const parsed = parseOfferForm(formData);
  if ("error" in parsed) return parsed;

  if (parsed.data.slug !== existing.slug) {
    const slugConflict = await getOfferRecordById(parsed.data.slug);
    if (slugConflict && slugConflict.id !== id) {
      return { error: "Another offer already uses this slug." };
    }
  }

  await updateOffer(id, parsed.data);

  await logAuditEvent({
    action: "offer.update",
    resource: "bookable_offer",
    resourceId: id,
    actorAdminId: session.id,
    actorRole: session.role,
  });

  revalidatePath("/admin/packages");
  revalidatePath("/book");
  redirect("/admin/packages");
}
