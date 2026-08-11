"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import {
  saveFinalReflectionAction,
  saveTestimonialAction,
} from "@/lib/journey/journey-actions";
import type { TestimonialConsent } from "@prisma/client";

type FinalJourneyFormsProps = {
  packageId: string;
};

export function FinalJourneyForms({ packageId }: FinalJourneyFormsProps) {
  const [whatChanged, setWhatChanged] = useState("");
  const [mostValuable, setMostValuable] = useState("");
  const [selfDiscovery, setSelfDiscovery] = useState("");
  const [takeForward, setTakeForward] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [rating, setRating] = useState(0);
  const [testimonial, setTestimonial] = useState("");
  const [consent, setConsent] = useState<TestimonialConsent>("PRIVATE");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveFinalReflection() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveFinalReflectionAction(packageId, {
        whatChanged,
        mostValuable,
        selfDiscovery,
        takeForward,
        recommendation,
        rating,
      });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Final reflection saved.");
    });
  }

  function saveTestimonial() {
    startTransition(async () => {
      await saveTestimonialAction(packageId, { content: testimonial, consent });
    });
  }

  return (
    <div className="layout-stack-lg">
      <section className="observed-card p-6 md:p-8">
        <h2 className="type-heading-sm">Your journey is complete</h2>
        <p className="type-body mt-2 text-ink-subtle">Looking back…</p>

        {[
          { id: "whatChanged", label: "What changed for you?", value: whatChanged, set: setWhatChanged },
          { id: "mostValuable", label: "What was the most valuable part of this journey?", value: mostValuable, set: setMostValuable },
          { id: "selfDiscovery", label: "What did you discover about yourself?", value: selfDiscovery, set: setSelfDiscovery },
          { id: "takeForward", label: "What will you take forward?", value: takeForward, set: setTakeForward },
          { id: "recommendation", label: "What would you tell someone considering this work?", value: recommendation, set: setRecommendation },
        ].map((field) => (
          <Field key={field.id} label={field.label} id={field.id} className="mt-6">
            <Textarea
              id={field.id}
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
            />
          </Field>
        ))}

        <Field label="Overall rating" id="finalRating" className="mt-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`h-10 w-10 rounded-full border ${
                  rating === value ? "border-accent bg-accent/10 text-accent" : "border-border-subtle"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </Field>

        <Button type="button" className="mt-6" onClick={saveFinalReflection} disabled={isPending || rating < 1}>
          Save final reflection
        </Button>
        {message ? <p className="type-caption mt-4 text-accent">{message}</p> : null}
      </section>

      <section className="observed-card p-6 md:p-8">
        <h2 className="type-heading-sm">Would you like to share your experience?</h2>
        <fieldset className="mt-4">
          <legend className="sr-only">Sharing preference</legend>
          {(
            [
              ["PRIVATE", "Keep private"],
              ["ANONYMOUS", "Share anonymously"],
              ["NAMED", "Share with my name"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="mt-2 flex items-center gap-3">
              <input
                type="radio"
                name="testimonialConsent"
                checked={consent === value}
                onChange={() => setConsent(value)}
              />
              <span className="type-body">{label}</span>
            </label>
          ))}
        </fieldset>
        <Field label="Your experience…" id="testimonial" className="mt-6">
          <Textarea id="testimonial" value={testimonial} onChange={(e) => setTestimonial(e.target.value)} />
        </Field>
        <Button type="button" variant="secondary" className="mt-4" onClick={saveTestimonial} disabled={isPending}>
          Save testimonial preference
        </Button>
        <p className="type-caption mt-4 text-ink-subtle">
          Testimonials are never published automatically. Niks reviews them before any public use.
        </p>
      </section>
    </div>
  );
}
