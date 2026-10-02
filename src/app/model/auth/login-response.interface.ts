import AdminUserInterface from '@model/auth/admin-user.interface';

export default interface LoginResponseInterface {
  status: string;
  token: string;
  expiresAt: number;
  user: AdminUserInterface;
}
