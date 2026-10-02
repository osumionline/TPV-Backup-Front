import AdminUserInterface from '@model/auth/admin-user.interface';

export default interface MeResponseInterface {
  status: string;
  user: AdminUserInterface;
}
