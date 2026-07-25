export type BackupScope = "full" | "clients" | "sessions" | "payments" | "audit_logs";

export type EncryptedBackupManifest = {
  version: 1;
  createdAt: string;
  scope: BackupScope;
  encrypted: true;
  algorithm: "aes-256-gcm";
  keyDerivation: "scrypt";
  recordCount: number;
  checksumSha256: string;
};

export type BackupJobRequest = {
  scope: BackupScope;
  requestedByUserId: string;
  destination: "local_encrypted" | "s3_sse_kms" | "offsite_vault";
};

/**
 * Encrypted backup strategy:
 * 1. Export PostgreSQL data via pg_dump scoped by table groups.
 * 2. Encrypt dump with ENCRYPTION_KEY before leaving the application host.
 * 3. Store encrypted artifact in object storage with SSE-KMS.
 * 4. Retain manifest metadata (record counts, checksum) for restore validation.
 * 5. Rotate backups on a schedule and test restores quarterly.
 */
export function buildBackupManifest(
  scope: BackupScope,
  recordCount: number,
  checksumSha256: string,
): EncryptedBackupManifest {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    scope,
    encrypted: true,
    algorithm: "aes-256-gcm",
    keyDerivation: "scrypt",
    recordCount,
    checksumSha256,
  };
}

export function describeBackupDestination(
  destination: BackupJobRequest["destination"],
): string {
  switch (destination) {
    case "local_encrypted":
      return "Encrypted local archive for short-term retention during development.";
    case "s3_sse_kms":
      return "AWS S3 bucket with server-side KMS encryption for production retention.";
    case "offsite_vault":
      return "Offsite encrypted vault for disaster recovery and GDPR-compliant retention.";
    default:
      return "Unknown destination.";
  }
}
