export const BEFORE_CHECKLIST_ITEMS = [
  {
    key: "reaction_uncontrollable",
    label: "Reaction feels uncontrollable",
  },
  {
    key: "strong_emotional_activation",
    label: "Strong emotional activation",
  },
  {
    key: "repetitive_thoughts",
    label: "Repetitive thoughts",
  },
  {
    key: "checking_behaviours",
    label: "Checking behaviours",
  },
  {
    key: "fear_response",
    label: "Fear response",
  },
] as const;

export const CURRENT_CHECKLIST_ITEMS = [
  {
    key: "reaction_intensity_decreased",
    label: "Reaction intensity decreased",
  },
  {
    key: "more_emotional_space",
    label: "More emotional space",
  },
  {
    key: "less_automatic_behaviour",
    label: "Less automatic behaviour",
  },
  {
    key: "faster_recovery",
    label: "Faster recovery",
  },
  {
    key: "new_choices_available",
    label: "New choices available",
  },
] as const;

export type BeforeChecklistKey = (typeof BEFORE_CHECKLIST_ITEMS)[number]["key"];
export type CurrentChecklistKey =
  (typeof CURRENT_CHECKLIST_ITEMS)[number]["key"];

export type ChecklistItemKey = BeforeChecklistKey | CurrentChecklistKey;

export const REACTION_ANALYSIS_FIELDS = [
  { key: "mainConcern", label: "Main concern" },
  { key: "triggers", label: "Triggers" },
  { key: "automaticReactions", label: "Automatic reactions" },
  { key: "bodySensations", label: "Body sensations" },
  { key: "emotionalResponses", label: "Emotional responses" },
  { key: "oldPatterns", label: "Old patterns" },
  { key: "currentResponses", label: "Current responses" },
  { key: "notes", label: "Notes" },
] as const;

export type ReactionAnalysisFieldKey =
  (typeof REACTION_ANALYSIS_FIELDS)[number]["key"];
