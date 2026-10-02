export default interface UpdateSubscriptionRequestInterface {
  publicId: string;
  name: string;
  contactEmail: string | null;
  expiresAt: string | null;
  maxInstallations: number;
  maxBackupsPerInstallation: number;
}
