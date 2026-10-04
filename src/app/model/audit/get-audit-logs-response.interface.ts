import AuditLogInterface from '@model/audit/audit-log.interface';

export default interface GetAuditLogsResponseInterface {
  status: string;
  message: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  list: AuditLogInterface[];
}
