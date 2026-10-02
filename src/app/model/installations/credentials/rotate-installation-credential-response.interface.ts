export default interface RotateInstallationCredentialResponseInterface {
  status: string;
  publicId: string;
  credential: {
    keyId: string;
    secret: string;
  };
  message: string;
}
