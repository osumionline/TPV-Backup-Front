import BackupInterface from '@model/backups/backup.interface';

export default interface GetBackupsResponseInterface {
  status: string;
  list: BackupInterface[];
}
