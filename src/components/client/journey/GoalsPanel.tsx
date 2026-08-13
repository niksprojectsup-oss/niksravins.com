"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { saveGoalAction } from "@/lib/journey/journey-actions";
import type { JourneyGoal } from "@/lib/journey/journey-repository";
import { cn } from "@/lib/utils";

type GoalsPanelProps = {
  goals: JourneyGoal[];
  showForm?: boolean;
  compact?: boolean;
};

export function GoalsPanel({ goals, showForm = true, compact = false }: GoalsPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveGoalAction({ title, description });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setTitle("");
      setDescription("");
      setMessage("Intention saved.");
    });
  }

  function markComplete(goal: JourneyGoal) {
    startTransition(async () => {
      await saveGoalAction({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        status: "COMPLETED",
      });
    });
  }

  const activeGoals = goals.filter((g) => g.status !== "COMPLETED");

  return (
    <div className="layout-stack-lg">
      {showForm ? (
        <section className="observed-card p-6 md:p-8">
          <h2 className="type-heading-sm">My intention</h2>
          <p className="type-body mt-2 text-ink-subtle">
            By the end of this journey, I want to…
          </p>
          <Field label="Title" id="goalTitle" className="mt-6">
            <Input
              id="goalTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A short intention"
            />
          </Field>
          <Field label="Description (optional)" id="goalDescription" className="mt-4">
            <Textarea
              id="goalDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <div className="mt-4 flex items-center gap-4">
            <Button type="button" onClick={handleCreate} disabled={isPending || !title.trim()}>
              {isPending ? "Saving…" : "Save intention"}
            </Button>
            {message ? <p className="type-caption text-accent">{message}</p> : null}
          </div>
        </section>
      ) : null}

      <section>
        {!compact ? <h2 className="type-heading-sm">What I&apos;m working on</h2> : null}
        {activeGoals.length === 0 ? (
          !compact ? (
            <p className="type-body mt-4 text-ink-subtle">
              What would you like to transform?
            </p>
          ) : null
        ) : (
          <ul className={cn("layout-stack-md", !compact && "mt-4")}>
            {activeGoals.map((goal) => (
              <li key={goal.id} className={compact ? "rounded-xl border border-border-subtle p-4" : "observed-card p-6"}>
                <p className="type-body text-ink">{goal.title}</p>
                {goal.description ? (
                  <p className="type-body mt-2 text-ink-subtle">{goal.description}</p>
                ) : null}
                {!compact ? (
                  <>
                    <p className="type-caption mt-3 capitalize">{goal.status.toLowerCase().replace("_", " ")}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-4"
                      onClick={() => markComplete(goal)}
                      disabled={isPending}
                    >
                      Mark completed
                    </Button>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
