export default interface CreateSubscriptionRequestInterface {
  name: string;
  contactEmail: string | null;
  expiresAt: string | null;
  maxInstallations: number;
  maxBackupsPerInstallation: number;
}
