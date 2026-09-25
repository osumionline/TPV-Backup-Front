import AdminUserInterface from '@model/admin-user.interface';

export default interface MeResponseInterface {
  status: string;
  user: AdminUserInterface;
}
