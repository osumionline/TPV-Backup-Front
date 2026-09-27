export default interface CreateSubscriptionFormInterface {
  name: string;
  contactEmail: string;
  expiresAt: string;
  maxInstallations: number;
  maxBackupsPerInstallation: number;
}
