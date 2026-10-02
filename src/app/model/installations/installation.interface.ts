export default interface InstallationInterface {
  publicId: string;
  subscriptionPublicId: string;
  subscriptionName: string;
  name: string;
  active: boolean;
  lastSeenAt: string | null;
  hasActiveCredential: boolean;
  credentialKeyId: string | null;
  credentialLastUsedAt: string | null;
  credentialCreatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
