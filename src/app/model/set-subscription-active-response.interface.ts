export default interface SetSubscriptionActiveResponseInterface {
  status: string;
  publicId: string | null;
  active: boolean | null;
  message: string;
}
