"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { ASSESSMENT_DIMENSIONS } from "@/lib/journey/constants";
import { saveSelfAssessmentAction } from "@/lib/journey/journey-actions";
import type { AssessmentPhase } from "@prisma/client";

type SelfAssessmentFormProps = {
  phase: AssessmentPhase;
  title: string;
  subtitle: string;
  packageId?: string | null;
};

export function SelfAssessmentForm({
  phase,
  title,
  subtitle,
  packageId,
}: SelfAssessmentFormProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(ASSESSMENT_DIMENSIONS.map((d) => [d.key, 5])),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveSelfAssessmentAction({
        phase,
        packageId: packageId ?? null,
        clarity: scores.clarity,
        confidence: scores.confidence,
        connection: scores.connection,
        movingForward: scores.movingForward,
        emotionalBalance: scores.emotionalBalance,
        feelingStuck: scores.feelingStuck,
      });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Assessment saved.");
    });
  }

  return (
    <section className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">{title}</h2>
      <p className="type-body mt-2 text-ink-subtle">{subtitle}</p>
      <p className="type-caption mt-4">
        Rate each area from 0 (low) to 10 (high). This is your self-reflection, not a clinical score.
      </p>

      <div className="mt-8 layout-stack-lg">
        {ASSESSMENT_DIMENSIONS.map((dimension) => (
          <div key={dimension.key}>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor={dimension.key} className="type-body text-ink">
                {dimension.label}
                {dimension.inverted ? (
                  <span className="type-caption ml-2 text-ink-subtle">
                    (lower is better)
                  </span>
                ) : null}
              </label>
              <span className="type-body w-8 text-center">{scores[dimension.key]}</span>
            </div>
            <input
              id={dimension.key}
              type="range"
              min={0}
              max={10}
              value={scores[dimension.key]}
              onChange={(e) =>
                setScores({ ...scores, [dimension.key]: Number(e.target.value) })
              }
              className="mt-2 w-full accent-accent"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save assessment"}
        </Button>
        {message ? <p className="type-caption text-accent">{message}</p> : null}
      </div>
    </section>
  );
}
