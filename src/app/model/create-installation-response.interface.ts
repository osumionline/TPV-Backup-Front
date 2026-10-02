export default interface CreateInstallationResponseInterface {
  status: string;
  publicId: string;
  credential: {
    keyId: string;
    secret: string;
  };
  message: string;
}
