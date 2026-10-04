export default interface BackupInterface {
  publicId: string;
  installationPublicId: string | null;
  installationName: string | null;
  subscriptionPublicId: string | null;
  subscriptionName: string | null;
  backupId: string;
  createdAtClient: string;
  formatVersion: number;
  application: string;
  applicationVersion: string;
  databaseSchemaVersion: number;
  originalFilename: string;
  sizeBytes: number;
  sha256: string;
  createdAt: string;
  updatedAt: string;
}
