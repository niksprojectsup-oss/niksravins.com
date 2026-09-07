"use client";

import { useState, useTransition } from "react";
import type { StoreProduct, StoreProductStatus, StoreProductType } from "@prisma/client";
import Link from "next/link";
import {
  createStoreProductAction,
  updateStoreProductAction,
} from "@/lib/admin/actions/store-products";
import { DEFAULT_LICENSE_NOTICE } from "@/lib/store/types";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const PRODUCT_TYPE_OPTIONS: { value: StoreProductType; label: string }[] = [
  { value: "VIDEO", label: "Video" },
  { value: "MEDITATION", label: "Meditation" },
  { value: "COURSE", label: "Course" },
  { value: "SESSION", label: "Session" },
];

const STATUS_OPTIONS: { value: StoreProductStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
];

type StoreProductFormProps = {
  product?: StoreProduct;
};

export function StoreProductForm({ product }: StoreProductFormProps) {
  const isEditing = Boolean(product);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateStoreProductAction(product!.id, formData)
        : await createStoreProductAction(formData);

      if (result && "error" in result) {
        setError(result.error ?? "Unable to save product.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="layout-stack-lg max-w-wide">
      {error ? (
        <p className="type-body text-warm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="observed-card p-6 md:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Title" id="title">
            <Input
              id="title"
              name="title"
              defaultValue={product?.title ?? ""}
              required
              maxLength={200}
            />
          </Field>

          <Field label="Slug" id="slug">
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder="auto-generated from title if empty"
              pattern="[a-z0-9-]+"
            />
          </Field>

          <Field label="Product type" id="productType">
            <Select
              id="productType"
              name="productType"
              defaultValue={product?.productType ?? "VIDEO"}
              required
            >
              {PRODUCT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Status" id="status">
            <Select
              id="status"
              name="status"
              defaultValue={product?.status ?? "DRAFT"}
              required
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Price (EUR)" id="priceEuros">
            <Input
              id="priceEuros"
              name="priceEuros"
              type="number"
              min={0}
              step={0.01}
              defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""}
              required
            />
          </Field>

          <Field label="Sort order" id="sortOrder">
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              step={1}
              defaultValue={product?.sortOrder ?? 0}
            />
          </Field>

          <Field label="Thumbnail URL" id="thumbnailUrl" className="md:col-span-2">
            <Input
              id="thumbnailUrl"
              name="thumbnailUrl"
              type="url"
              defaultValue={product?.thumbnailUrl ?? ""}
              placeholder="https://..."
            />
          </Field>

          <Field label="Description" id="description" className="md:col-span-2">
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              required
              minLength={10}
              rows={4}
            />
          </Field>

          <Field label="Content key" id="contentKey" className="md:col-span-2">
            <Input
              id="contentKey"
              name="contentKey"
              defaultValue={product?.contentKey ?? ""}
              placeholder="yoga-20min.mp4"
            />
          </Field>

          <Field label="Content MIME type" id="contentMimeType">
            <Input
              id="contentMimeType"
              name="contentMimeType"
              defaultValue={product?.contentMimeType ?? "video/mp4"}
              placeholder="video/mp4"
            />
          </Field>

          <Field label="Duration (seconds)" id="contentDurationSeconds">
            <Input
              id="contentDurationSeconds"
              name="contentDurationSeconds"
              type="number"
              min={1}
              step={1}
              defaultValue={product?.contentDurationSeconds ?? ""}
            />
          </Field>

          <Field label="Bookable offer ID (optional)" id="bookableOfferId" className="md:col-span-2">
            <Input
              id="bookableOfferId"
              name="bookableOfferId"
              defaultValue={product?.bookableOfferId ?? ""}
            />
          </Field>

          <Field label="License notice" id="licenseNotice" className="md:col-span-2">
            <Textarea
              id="licenseNotice"
              name="licenseNotice"
              defaultValue={product?.licenseNotice ?? DEFAULT_LICENSE_NOTICE}
              rows={3}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isEditing ? "Save product" : "Create product"}
        </Button>
        <Link href="/admin/store" className="type-accent-link type-caption">
          Cancel
        </Link>
      </div>
    </form>
  );
}
