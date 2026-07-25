export type DataSubjectRequestType = "export" | "delete" | "rectify" | "restrict";

export type DataSubjectRequest = {
  id: string;
  clientId: string;
  type: DataSubjectRequestType;
  requestedAt: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  completedAt?: string | null;
};

export type ClientDataExport = {
  profile: Record<string, unknown>;
  reactionAnalysis: Record<string, unknown>;
  sessions: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  exportedAt: string;
  format: "json";
};

/**
 * GDPR readiness:
 * - Audit logs record data access and mutations.
 * - Field encryption protects sensitive notes at rest.
 * - Client users are scoped to own records via RBAC.
 * - Export and deletion workflows should be implemented against these types.
 */
export function buildDataExportManifest(clientId: string): Omit<ClientDataExport, "profile" | "reactionAnalysis" | "sessions" | "payments"> {
  return {
    exportedAt: new Date().toISOString(),
    format: "json",
  };
}

export const DATA_RETENTION_DAYS = {
  auditLogs: 365 * 7,
  inactiveClientRecords: 365 * 3,
  paymentRecords: 365 * 10,
} as const;
