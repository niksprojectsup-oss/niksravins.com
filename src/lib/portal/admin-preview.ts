import type { PortalContent } from "@/content/i18n/portal";
import type { AuditLogInput } from "@/lib/security/audit";

export const ADMIN_PORTAL_PREVIEW_PATH = "/admin/portal-preview";

export const ADMIN_PORTAL_PREVIEW_LABEL = "Administrator Preview — not a client session";

export const ADMIN_PORTAL_PREVIEW_SECTIONS = [
  "home",
  "journey",
  "sessions",
  "insights",
  "journal",
] as const;

export type AdminPortalPreviewSection = (typeof ADMIN_PORTAL_PREVIEW_SECTIONS)[number];

export type PreviewPeriod = "3" | "6" | "all";

export type PreviewInsightCategory = "PATTERN" | "TRIGGER" | "POSITIVE_OBSERVATION";

export type PreviewInsightFilter = "ALL" | PreviewInsightCategory;

export type PreviewAssessment = {
  id: string;
  createdAt: string;
  clarity: number;
  confidence: number;
  connection: number;
  movingForward: number;
  emotionalBalance: number;
  feelingStuck: number;
};

export type PreviewSession = {
  id: string;
  sessionNumber: number;
  sessionType: string;
  scheduledAt: string;
  status: "SCHEDULED" | "COMPLETED";
  takeaway: string | null;
  rating: number | null;
};

export type PreviewInsight = {
  id: string;
  content: string;
  category: PreviewInsightCategory;
  observedOn: string;
  visibility: "PRIVATE" | "SHARED";
};

export type PreviewTimelineSlot = {
  sessionNumber: number;
  status: "completed" | "scheduled" | "not_scheduled";
  scheduledAt: string | null;
};

export type PreviewMilestoneKey =
  | "journey_started"
  | "first_reflection"
  | "first_session_completed"
  | "first_breakthrough"
  | "midpoint"
  | "final_session"
  | "journey_completed";

export type PreviewMilestone = {
  key: PreviewMilestoneKey;
  achieved: boolean;
  achievedAt: string | null;
};

export type AdminPortalPreviewData = {
  firstName: string;
  timezone: string;
  asOf: string;
  preparationNote: string;
  completedSessions: number;
  recordedChanges: number;
  assessments: PreviewAssessment[];
  sessions: PreviewSession[];
  insights: PreviewInsight[];
  timeline: PreviewTimelineSlot[];
  milestones: PreviewMilestone[];
};

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/** Preview controls never persist. */
export function previewMutationsAllowed(): false {
  return false;
}

export function previewSectionLabel(
  section: AdminPortalPreviewSection,
  content: Pick<PortalContent, "nav" | "journeyPage" | "cards">,
): string {
  switch (section) {
    case "home":
      return content.nav.home;
    case "journey":
      return content.journeyPage.title;
    case "sessions":
      return content.nav.sessions;
    case "insights":
      return content.nav.insights;
    case "journal":
      return content.cards.journalTitle;
  }
}

export function filterPreviewAssessments(
  items: PreviewAssessment[],
  period: PreviewPeriod,
  asOf: string,
): PreviewAssessment[] {
  const now = Date.parse(asOf);
  const windowMs = period === "all" ? null : Number(period) * MONTH_MS;
  return items.filter((item) => {
    if (windowMs === null) return true;
    return now - Date.parse(item.createdAt) <= windowMs;
  });
}

export function filterPreviewInsights(
  items: PreviewInsight[],
  query: string,
  category: PreviewInsightFilter,
): PreviewInsight[] {
  const needle = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category !== "ALL" && item.category !== category) return false;
    if (!needle) return true;
    return item.content.toLowerCase().includes(needle);
  });
}

export function filterPreviewJournal(sessions: PreviewSession[], query: string): PreviewSession[] {
  const needle = query.trim().toLowerCase();
  return sessions.filter((session) => {
    if (session.status !== "COMPLETED" || !session.takeaway) return false;
    if (!needle) return true;
    return (
      session.takeaway.toLowerCase().includes(needle) ||
      session.sessionType.toLowerCase().includes(needle)
    );
  });
}

/** Sample portal fields with no client, user, booking, or payment identifiers. */
export function buildAdminPortalPreviewFixture(): AdminPortalPreviewData {
  return {
    firstName: "Preview",
    timezone: "Europe/Riga",
    asOf: "2026-10-16T12:00:00.000Z",
    preparationNote: "I want to notice the pause before I answer.",
    completedSessions: 2,
    recordedChanges: 3,
    assessments: [
      {
        id: "sample-assessment-1",
        createdAt: "2026-01-15T09:00:00.000Z",
        clarity: 3,
        confidence: 3,
        connection: 4,
        movingForward: 3,
        emotionalBalance: 4,
        feelingStuck: 7,
      },
      {
        id: "sample-assessment-2",
        createdAt: "2026-06-15T09:00:00.000Z",
        clarity: 5,
        confidence: 5,
        connection: 5,
        movingForward: 5,
        emotionalBalance: 6,
        feelingStuck: 5,
      },
      {
        id: "sample-assessment-3",
        createdAt: "2026-09-15T09:00:00.000Z",
        clarity: 7,
        confidence: 6,
        connection: 7,
        movingForward: 7,
        emotionalBalance: 7,
        feelingStuck: 3,
      },
    ],
    sessions: [
      {
        id: "sample-session-1",
        sessionNumber: 1,
        sessionType: "Sample session",
        scheduledAt: "2026-08-01T10:00:00.000Z",
        status: "COMPLETED",
        takeaway: "I can name the pattern.",
        rating: 4,
      },
      {
        id: "sample-session-2",
        sessionNumber: 2,
        sessionType: "Sample session",
        scheduledAt: "2026-09-05T10:00:00.000Z",
        status: "COMPLETED",
        takeaway: "The pause is a choice.",
        rating: 5,
      },
      {
        id: "sample-session-3",
        sessionNumber: 3,
        sessionType: "Sample session",
        scheduledAt: "2026-11-02T10:00:00.000Z",
        status: "SCHEDULED",
        takeaway: null,
        rating: null,
      },
    ],
    insights: [
      {
        id: "sample-insight-1",
        content: "I notice I pause before answering.",
        category: "PATTERN",
        observedOn: "2026-09-02",
        visibility: "PRIVATE",
      },
      {
        id: "sample-insight-2",
        content: "A full calendar makes the old story louder.",
        category: "TRIGGER",
        observedOn: "2026-08-18",
        visibility: "SHARED",
      },
      {
        id: "sample-insight-3",
        content: "I asked for help without apologising.",
        category: "POSITIVE_OBSERVATION",
        observedOn: "2026-09-20",
        visibility: "PRIVATE",
      },
    ],
    timeline: [
      { sessionNumber: 1, status: "completed", scheduledAt: "2026-08-01T10:00:00.000Z" },
      { sessionNumber: 2, status: "completed", scheduledAt: "2026-09-05T10:00:00.000Z" },
      { sessionNumber: 3, status: "scheduled", scheduledAt: "2026-11-02T10:00:00.000Z" },
      { sessionNumber: 4, status: "not_scheduled", scheduledAt: null },
      { sessionNumber: 5, status: "not_scheduled", scheduledAt: null },
    ],
    milestones: [
      { key: "journey_started", achieved: true, achievedAt: "2026-08-01T10:00:00.000Z" },
      { key: "first_reflection", achieved: true, achievedAt: "2026-08-02T10:00:00.000Z" },
      { key: "first_session_completed", achieved: true, achievedAt: "2026-08-01T11:00:00.000Z" },
      { key: "first_breakthrough", achieved: false, achievedAt: null },
      { key: "midpoint", achieved: false, achievedAt: null },
      { key: "final_session", achieved: false, achievedAt: null },
      { key: "journey_completed", achieved: false, achievedAt: null },
    ],
  };
}

export function buildAdminPortalPreviewAudit(actorAdminId: string): AuditLogInput {
  return {
    action: "portal.preview",
    resource: "portal",
    resourceId: null,
    actorAdminId,
    actorRole: "ADMIN",
    metadata: {
      clientSession: false,
      sampleData: true,
    },
  };
}
