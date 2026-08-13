export const CHECK_IN_MOODS = [
  { key: "GREAT", label: "Great", emoji: "✨" },
  { key: "GOOD", label: "Good", emoji: "🙂" },
  { key: "CALM", label: "Calm", emoji: "🌿" },
  { key: "NEUTRAL", label: "Neutral", emoji: "😐" },
  { key: "ANXIOUS", label: "Anxious", emoji: "😟" },
  { key: "LOW", label: "Low", emoji: "🌧️" },
  { key: "OVERWHELMED", label: "Overwhelmed", emoji: "🌊" },
] as const;

export type CheckInMoodKey = (typeof CHECK_IN_MOODS)[number]["key"];

export const EMOTION_TAGS = [
  "Calm",
  "Clear",
  "Energised",
  "Emotional",
  "Stuck",
  "Hopeful",
] as const;

/** Legacy tags still accepted when editing older check-ins */
export const LEGACY_EMOTION_TAGS = [
  "Motivated",
  "Confused",
  "Anxious",
  "Sad",
  "Angry",
  "Excited",
  "Tired",
  "Connected",
  "Disconnected",
  "Other",
] as const;

export const JOURNAL_PROMPTS = [
  { key: "mind", label: "What's on your mind today?" },
  { key: "noticing", label: "What are you noticing today?" },
  { key: "changed", label: "What has changed since your last session?" },
  { key: "different", label: "What feels different?" },
  { key: "struggling", label: "What are you struggling with?" },
  { key: "proud", label: "What are you proud of?" },
  { key: "free", label: "Free reflection" },
] as const;

export const ASSESSMENT_DIMENSIONS = [
  { key: "clarity", label: "Clarity", inverted: false },
  { key: "confidence", label: "Confidence", inverted: false },
  { key: "connection", label: "Connection with myself", inverted: false },
  { key: "movingForward", label: "Ability to move forward", inverted: false },
  { key: "emotionalBalance", label: "Emotional balance", inverted: false },
  { key: "feelingStuck", label: "Feeling stuck", inverted: true },
] as const;

export type AssessmentDimensionKey = (typeof ASSESSMENT_DIMENSIONS)[number]["key"];

export const MILESTONE_KEYS = {
  JOURNEY_STARTED: "journey_started",
  FIRST_REFLECTION: "first_reflection",
  FIRST_SESSION_COMPLETED: "first_session_completed",
  FIRST_BREAKTHROUGH: "first_breakthrough",
  MIDPOINT: "midpoint",
  FINAL_SESSION: "final_session",
  JOURNEY_COMPLETED: "journey_completed",
} as const;

export type MilestoneKey = (typeof MILESTONE_KEYS)[keyof typeof MILESTONE_KEYS];

export const MILESTONE_LABELS: Record<MilestoneKey, string> = {
  journey_started: "Journey started",
  first_reflection: "First reflection",
  first_session_completed: "First session completed",
  first_breakthrough: "First breakthrough",
  midpoint: "Midpoint",
  final_session: "Final session",
  journey_completed: "Journey completed",
};
