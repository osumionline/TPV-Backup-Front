export default interface SubscriptionFormInterface {
  name: string;
  contactEmail: string;
  expiresAt: Date | null;
  maxInstallations: number;
  maxBackupsPerInstallation: number;
}
