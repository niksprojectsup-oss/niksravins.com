export const CHECK_IN_MOODS = [
  { key: "GREAT", label: "Great" },
  { key: "GOOD", label: "Good" },
  { key: "CALM", label: "Calm" },
  { key: "NEUTRAL", label: "Neutral" },
  { key: "ANXIOUS", label: "Anxious" },
  { key: "LOW", label: "Low" },
  { key: "OVERWHELMED", label: "Overwhelmed" },
] as const;

export type CheckInMoodKey = (typeof CHECK_IN_MOODS)[number]["key"];

export const EMOTION_TAGS = [
  "Calm",
  "Hopeful",
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
  { key: "noticing", label: "What am I noticing about myself?" },
  { key: "different", label: "What feels different this week?" },
  { key: "understanding", label: "What am I beginning to understand?" },
  { key: "avoiding", label: "What am I avoiding?" },
  { key: "proud", label: "What am I proud of?" },
  { key: "need", label: "What do I need right now?" },
  { key: "shifted", label: "What shifted recently?" },
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
