export default interface CreateSubscriptionFormInterface {
  name: string;
  contactEmail: string;
  expiresAt: Date | null;
  maxInstallations: number;
  maxBackupsPerInstallation: number;
}
