import AdminUserInterface from '@model/admin-user.interface';

export default interface LoginResponseInterface {
  status: string;
  token: string;
  expiresAt: number;
  user: AdminUserInterface;
}
