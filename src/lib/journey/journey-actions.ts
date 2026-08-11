"use server";

import { revalidatePath } from "next/cache";
import type {
  AssessmentPhase,
  CheckInMood,
  GoalStatus,
  JournalVisibility,
  TestimonialConsent,
} from "@prisma/client";
import { getServerSession } from "@/lib/auth/session";
import { isClientAuthSessionActive } from "@/lib/auth/client-repository";
import { JourneyForbiddenError, JourneyError } from "./errors";
import {
  createGoal,
  createJournalEntry,
  createSelfAssessment,
  deleteJournalEntry,
  updateGoal,
  updateJournalEntry,
  upsertCheckIn,
  upsertFinalReflection,
  upsertSessionPreparation,
  upsertSessionReflection,
  upsertTestimonial,
} from "./journey-repository";
import {
  isValidAssessmentScore,
  isValidCheckInMood,
  isValidSessionRating,
  sanitizeEmotionTags,
} from "./validation";

export type JourneyActionState = {
  error?: string;
  success?: boolean;
};

async function requireClientForJourneyAction(): Promise<{ clientId: string }> {
  const session = await getServerSession();
  if (!session || session.role !== "CLIENT" || !session.clientId) {
    throw new JourneyForbiddenError("You must be signed in.");
  }
  const active = await isClientAuthSessionActive(session.sessionId);
  if (!active) {
    throw new JourneyForbiddenError("Your session has expired. Please sign in again.");
  }
  return { clientId: session.clientId };
}

function handleActionError(error: unknown): JourneyActionState {
  if (error instanceof JourneyForbiddenError) {
    return { error: error.message };
  }
  if (error instanceof JourneyError) {
    return { error: error.message };
  }
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: "Something went wrong. Please try again." };
}

function revalidateJourneyPaths() {
  revalidatePath("/client/dashboard");
  revalidatePath("/client/journey");
  revalidatePath("/client/check-in");
  revalidatePath("/client/journal");
  revalidatePath("/client/progress");
  revalidatePath("/client/sessions");
}

export async function saveJournalEntryAction(
  input: {
    id?: string;
    content: string;
    prompt: string;
    visibility: JournalVisibility;
  },
): Promise<JourneyActionState> {
  try {
    const { clientId } = await requireClientForJourneyAction();
    const content = input.content.trim();
    if (!content) return { error: "Please write something before saving." };

    if (input.id) {
      await updateJournalEntry(clientId, input.id, {
        content,
        prompt: input.prompt,
        visibility: input.visibility,
      });
    } else {
      await createJournalEntry(clientId, {
        content,
        prompt: input.prompt,
        visibility: input.visibility,
      });
    }
    revalidateJourneyPaths();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteJournalEntryAction(entryId: string): Promise<JourneyActionState> {
  try {
    const { clientId } = await requireClientForJourneyAction();
    await deleteJournalEntry(clientId, entryId);
    revalidateJourneyPaths();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveCheckInAction(input: {
  mood: string;
  emotionTags: string[];
  intensity: number;
  notes: string;
  timezone: string;
}): Promise<JourneyActionState> {
  try {
    const { clientId } = await requireClientForJourneyAction();
    if (!isValidCheckInMood(input.mood)) {
      return { error: "Please select how you are feeling." };
    }
    if (input.intensity < 1 || input.intensity > 10) {
      return { error: "Intensity must be between 1 and 10." };
    }

    await upsertCheckIn(clientId, input.timezone, {
      mood: input.mood as CheckInMood,
      emotionTags: sanitizeEmotionTags(input.emotionTags),
      intensity: input.intensity,
      notes: input.notes.trim(),
    });
    revalidateJourneyPaths();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveGoalAction(input: {
  id?: string;
  title: string;
  description: string;
  status?: GoalStatus;
}): Promise<JourneyActionState> {
  try {
    const { clientId } = await requireClientForJourneyAction();
    const title = input.title.trim();
    if (!title) return { error: "Please add a title for your intention." };

    if (input.id) {
      await updateGoal(clientId, input.id, {
        title,
        description: input.description.trim(),
        status: input.status,
      });
    } else {
      await createGoal(clientId, {
        title,
        description: input.description.trim(),
      });
    }
    revalidateJourneyPaths();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveSelfAssessmentAction(input: {
  phase: AssessmentPhase;
  clarity: number;
  confidence: number;
  connection: number;
  movingForward: number;
  emotionalBalance: number;
  feelingStuck: number;
  packageId?: string | null;
}): Promise<JourneyActionState> {
  try {
    const { clientId } = await requireClientForJourneyAction();
    const scores = [
      input.clarity,
      input.confidence,
      input.connection,
      input.movingForward,
      input.emotionalBalance,
      input.feelingStuck,
    ];
    if (!scores.every(isValidAssessmentScore)) {
      return { error: "Each rating must be a whole number from 0 to 10." };
    }

    await createSelfAssessment(clientId, input);
    revalidateJourneyPaths();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveSessionPreparationAction(
  sessionId: string,
  reflection: string,
): Promise<JourneyActionState> {
  try {
    const { clientId } = await requireClientForJourneyAction();
    await upsertSessionPreparation(clientId, sessionId, reflection.trim());
    revalidateJourneyPaths();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveSessionReflectionAction(
  sessionId: string,
  input: {
    rating: number;
    valuablePart: string;
    whatShifted: string;
    takeaway: string;
    messageToPractitioner: string;
    sharedWithPractitioner: boolean;
  },
): Promise<JourneyActionState> {
  try {
    const { clientId } = await requireClientForJourneyAction();
    if (!isValidSessionRating(input.rating)) {
      return { error: "Please rate your session from 1 to 5." };
    }
    await upsertSessionReflection(clientId, sessionId, {
      ...input,
      valuablePart: input.valuablePart.trim(),
      whatShifted: input.whatShifted.trim(),
      takeaway: input.takeaway.trim(),
      messageToPractitioner: input.messageToPractitioner.trim(),
    });
    revalidateJourneyPaths();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveFinalReflectionAction(
  packageId: string,
  input: {
    whatChanged: string;
    mostValuable: string;
    selfDiscovery: string;
    takeForward: string;
    recommendation: string;
    rating: number;
  },
): Promise<JourneyActionState> {
  try {
    const { clientId } = await requireClientForJourneyAction();
    if (!isValidSessionRating(input.rating)) {
      return { error: "Please add a rating from 1 to 5." };
    }
    await upsertFinalReflection(clientId, packageId, {
      whatChanged: input.whatChanged.trim(),
      mostValuable: input.mostValuable.trim(),
      selfDiscovery: input.selfDiscovery.trim(),
      takeForward: input.takeForward.trim(),
      recommendation: input.recommendation.trim(),
      rating: input.rating,
    });
    revalidateJourneyPaths();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveTestimonialAction(
  packageId: string,
  input: { content: string; consent: TestimonialConsent },
): Promise<JourneyActionState> {
  try {
    const { clientId } = await requireClientForJourneyAction();
    await upsertTestimonial(clientId, packageId, {
      content: input.content.trim(),
      consent: input.consent,
    });
    revalidateJourneyPaths();
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
