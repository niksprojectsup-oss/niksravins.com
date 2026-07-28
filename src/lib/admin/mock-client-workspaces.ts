import {
  BEFORE_CHECKLIST_ITEMS,
  CURRENT_CHECKLIST_ITEMS,
} from "./client-constants";
import type { ClientListItem, ClientWorkspace } from "./client-types";

function defaultChecklist() {
  return {
    before: Object.fromEntries(
      BEFORE_CHECKLIST_ITEMS.map((item) => [item.key, false]),
    ),
    current: Object.fromEntries(
      CURRENT_CHECKLIST_ITEMS.map((item) => [item.key, false]),
    ),
  };
}

export const mockClientWorkspaces: Record<string, ClientWorkspace> = {
  cl_001: {
    id: "cl_001",
    firstName: "Anna",
    lastName: "Kalniņa",
    email: "anna.k@example.com",
    country: "Latvia",
    timezone: "Europe/Riga",
    status: "ACTIVE",
    firstSessionDate: "2026-05-10T09:00:00.000Z",
    reactionAnalysis: {
      mainConcern: "Sudden chest tightening before speaking in meetings.",
      triggers: "Being asked to present, senior colleagues in the room.",
      automaticReactions: "Shutdown, rushed speech, over-preparation the night before.",
      bodySensations: "Tight chest, shallow breathing, heat in face.",
      emotionalResponses: "Fear of being judged, urge to disappear.",
      oldPatterns: "Learned in school presentations aged 12.",
      currentResponses: "Still arrives, but less frequently and with more recovery time.",
      notes: "Strong insight. Reaction persists under pressure.",
    },
    checklist: {
      before: {
        reaction_uncontrollable: true,
        strong_emotional_activation: true,
        repetitive_thoughts: true,
        checking_behaviours: false,
        fear_response: true,
      },
      current: {
        reaction_intensity_decreased: true,
        more_emotional_space: true,
        less_automatic_behaviour: false,
        faster_recovery: true,
        new_choices_available: false,
      },
    },
    sessionNotes: [
      {
        id: "ses_001",
        scheduledAt: "2026-07-26T09:00:00.000Z",
        sessionType: "Initial AAP Session",
        mainTopic: "Pre-meeting chest tightening",
        notes: "Mapped association to early school presentation.",
        changesNoticed: "Client reported less dread the morning after.",
        nextFocus: "Track activation in low-stakes meetings.",
        status: "SCHEDULED",
      },
      {
        id: "ses_004",
        scheduledAt: "2026-07-18T09:00:00.000Z",
        sessionType: "Initial AAP Session",
        mainTopic: "Pre-meeting chest tightening",
        notes: "First processing of the presenting association.",
        changesNoticed: "Tightening reduced during role-play.",
        nextFocus: "Continue with same pattern.",
        status: "COMPLETED",
      },
    ],
    practitionerNotes:
      "Responds well to structured sessions. Avoid rushing toward insight.",
  },
  cl_002: {
    id: "cl_002",
    firstName: "James",
    lastName: "Whitmore",
    email: "j.whitmore@example.com",
    country: "United Kingdom",
    timezone: "Europe/London",
    status: "ACTIVE",
    firstSessionDate: "2026-07-15T11:00:00.000Z",
    reactionAnalysis: {
      mainConcern: "Compulsive checking of partner's social media.",
      triggers: "Evenings alone, ambiguous messages, travel.",
      automaticReactions: "Repeated checking, scanning, reassurance seeking.",
      bodySensations: "Restlessness, stomach tension.",
      emotionalResponses: "Jealousy, fear of abandonment.",
      oldPatterns: "Previous relationship betrayal.",
      currentResponses: "Checking still present but client notices it faster.",
      notes: "Initial session completed. Good engagement.",
    },
    checklist: {
      before: {
        reaction_uncontrollable: true,
        strong_emotional_activation: true,
        repetitive_thoughts: true,
        checking_behaviours: true,
        fear_response: true,
      },
      current: {
        reaction_intensity_decreased: false,
        more_emotional_space: false,
        less_automatic_behaviour: false,
        faster_recovery: false,
        new_choices_available: false,
      },
    },
    sessionNotes: [
      {
        id: "ses_002",
        scheduledAt: "2026-07-26T11:00:00.000Z",
        sessionType: "Initial AAP Session",
        mainTopic: "Social media checking",
        notes: "",
        changesNoticed: "",
        nextFocus: "",
        status: "SCHEDULED",
      },
    ],
    practitionerNotes: "New client. Monitor for over-disclosure in first sessions.",
  },
  cl_003: {
    id: "cl_003",
    firstName: "Sofia",
    lastName: "Marin",
    email: "sofia.m@example.com",
    country: "Germany",
    timezone: "Europe/Berlin",
    status: "ACTIVE",
    firstSessionDate: "2026-04-02T09:00:00.000Z",
    reactionAnalysis: {
      mainConcern: "Anger arriving before thought in conflict.",
      triggers: "Perceived dismissal, tone of voice, feeling unheard.",
      automaticReactions: "Immediate anger, raised voice, withdrawal after.",
      bodySensations: "Heat, jaw tension, pressure in head.",
      emotionalResponses: "Rage, shame afterward.",
      oldPatterns: "Childhood environment where anger was the only assertive option.",
      currentResponses: "Anger still comes but client can pause more often.",
      notes: "Package client — session 3 upcoming.",
    },
    checklist: {
      before: {
        reaction_uncontrollable: true,
        strong_emotional_activation: true,
        repetitive_thoughts: false,
        checking_behaviours: false,
        fear_response: false,
      },
      current: {
        reaction_intensity_decreased: true,
        more_emotional_space: true,
        less_automatic_behaviour: true,
        faster_recovery: true,
        new_choices_available: true,
      },
    },
    sessionNotes: [
      {
        id: "ses_003",
        scheduledAt: "2026-07-28T14:00:00.000Z",
        sessionType: "AAP Transformation Package",
        mainTopic: "Conflict anger pattern",
        notes: "Continue integration work.",
        changesNoticed: "Reported one pause before reacting at home.",
        nextFocus: "Deepen association work on dismissal trigger.",
        status: "SCHEDULED",
      },
    ],
    practitionerNotes: "Strong progress. Suitable for portal access when available.",
  },
};

export function getMockClientWorkspace(id: string): ClientWorkspace | null {
  return mockClientWorkspaces[id] ?? null;
}

export function getMockClientList(): ClientListItem[] {
  const now = Date.now();

  return Object.values(mockClientWorkspaces).map((client) => {
    const sortedSessions = [...client.sessionNotes].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
    const past = sortedSessions.filter(
      (session) =>
        session.status === "COMPLETED" ||
        new Date(session.scheduledAt).getTime() <= now,
    );
    const upcoming = sortedSessions
      .filter(
        (session) =>
          session.status === "SCHEDULED" &&
          new Date(session.scheduledAt).getTime() > now,
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );

    return {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      country: client.country,
      timezone: client.timezone,
      sessionsCount: client.sessionNotes.length,
      lastSessionAt: past[0]?.scheduledAt ?? null,
      nextSessionAt: upcoming[0]?.scheduledAt ?? null,
      paymentStatus:
        client.id === "cl_002" ? ("pending" as const) : ("paid" as const),
      createdAt: client.firstSessionDate ?? new Date().toISOString(),
      status: client.status,
    };
  });
}

export function createEmptyMockWorkspace(id: string): ClientWorkspace {
  return {
    id,
    firstName: "Unknown",
    lastName: "Client",
    email: "",
    country: "",
    timezone: "Europe/Riga",
    status: "ACTIVE",
    firstSessionDate: null,
    reactionAnalysis: {
      mainConcern: "",
      triggers: "",
      automaticReactions: "",
      bodySensations: "",
      emotionalResponses: "",
      oldPatterns: "",
      currentResponses: "",
      notes: "",
    },
    checklist: defaultChecklist(),
    sessionNotes: [],
    practitionerNotes: "",
  };
}
