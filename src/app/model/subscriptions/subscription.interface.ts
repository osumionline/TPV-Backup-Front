export default interface SubscriptionInterface {
  publicId: string;
  name: string;
  contactEmail: string | null;
  active: boolean;
  status: 'active' | 'expired' | 'disabled';
  expiresAt: string | null;
  maxInstallations: number;
  maxBackupsPerInstallation: number;
  installationCount: number;
  createdAt: string;
  updatedAt: string;
}
