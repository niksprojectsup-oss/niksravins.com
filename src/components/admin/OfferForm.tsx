"use client";

import { useState, useTransition } from "react";
import type { BookableOffer, OfferType } from "@prisma/client";
import Link from "next/link";
import { createOfferAction, updateOfferAction } from "@/lib/admin/actions/offers";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const OFFER_TYPE_OPTIONS: { value: OfferType; label: string }[] = [
  { value: "SINGLE_SESSION", label: "Single session" },
  { value: "PACKAGE", label: "Package" },
  { value: "COURSE", label: "Course / program" },
];

type OfferFormProps = {
  offer?: BookableOffer;
};

export function OfferForm({ offer }: OfferFormProps) {
  const isEditing = Boolean(offer);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [offerType, setOfferType] = useState<OfferType>(
    offer?.offerType ?? "SINGLE_SESSION",
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateOfferAction(offer!.id, formData)
        : await createOfferAction(formData);

      if (result && "error" in result) {
        setError(result.error ?? "Unable to save offer.");
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
              defaultValue={offer?.title ?? ""}
              required
              maxLength={200}
            />
          </Field>

          <Field label="Slug" id="slug">
            <Input
              id="slug"
              name="slug"
              defaultValue={offer?.slug ?? ""}
              placeholder="auto-generated from title if empty"
              pattern="[a-z0-9-]+"
            />
          </Field>

          <Field label="Offer type" id="offerType">
            <Select
              id="offerType"
              name="offerType"
              value={offerType}
              onChange={(event) => setOfferType(event.target.value as OfferType)}
              required
            >
              {OFFER_TYPE_OPTIONS.map((option) => (
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
              defaultValue={offer ? (offer.priceCents / 100).toFixed(2) : ""}
              required
            />
          </Field>

          <Field label="Duration (minutes)" id="durationMinutes">
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={1}
              defaultValue={offer?.durationMinutes ?? 45}
              required
            />
          </Field>

          <Field label="Duration label" id="durationLabel">
            <Input
              id="durationLabel"
              name="durationLabel"
              defaultValue={offer?.durationLabel ?? ""}
              placeholder="e.g. 45 minutes"
            />
          </Field>

          <Field label="Price label" id="priceLabel">
            <Input
              id="priceLabel"
              name="priceLabel"
              defaultValue={offer?.priceLabel ?? ""}
              placeholder="e.g. €90"
            />
          </Field>

          <Field label="Sort order" id="sortOrder">
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={offer?.sortOrder ?? 0}
            />
          </Field>

          {offerType === "PACKAGE" ? (
            <Field label="Package sessions" id="packageSessions">
              <Input
                id="packageSessions"
                name="packageSessions"
                type="number"
                min={2}
                defaultValue={offer?.packageSessions ?? 5}
              />
            </Field>
          ) : null}
        </div>

        <div className="mt-5 layout-stack-md">
          <Field label="Description" id="description">
            <Textarea
              id="description"
              name="description"
              defaultValue={offer?.description ?? ""}
              required
              minLength={10}
            />
          </Field>

          <Field label="Detail (optional)" id="detail">
            <Textarea id="detail" name="detail" defaultValue={offer?.detail ?? ""} />
          </Field>

          <Field label="Checkout note (optional)" id="checkoutNote">
            <Textarea
              id="checkoutNote"
              name="checkoutNote"
              defaultValue={offer?.checkoutNote ?? ""}
            />
          </Field>

          <Field label="Highlights (one per line)" id="highlights">
            <Textarea
              id="highlights"
              name="highlights"
              defaultValue={offer?.highlights.join("\n") ?? ""}
            />
          </Field>

          <Field label="Bonuses (one per line)" id="bonuses">
            <Textarea
              id="bonuses"
              name="bonuses"
              defaultValue={offer?.bonuses.join("\n") ?? ""}
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 type-body">
            <input
              type="checkbox"
              name="requiresStartDate"
              defaultChecked={offer?.requiresStartDate ?? offerType === "COURSE"}
              className="h-4 w-4 rounded border-border-strong"
            />
            Requires start date
          </label>

          <label className="inline-flex items-center gap-2 type-body">
            <input
              type="checkbox"
              name="active"
              defaultChecked={offer?.active ?? true}
              className="h-4 w-4 rounded border-border-strong"
            />
            Active
          </label>

          <label className="inline-flex items-center gap-2 type-body">
            <input
              type="checkbox"
              name="published"
              defaultChecked={offer?.published ?? true}
              className="h-4 w-4 rounded border-border-strong"
            />
            Visible on /book
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isEditing ? "Save changes" : "Create offer"}
        </Button>
        <Button href="/admin/packages" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
