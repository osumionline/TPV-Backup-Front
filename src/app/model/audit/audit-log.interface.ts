export default interface AuditLogInterface {
  actorType: 'admin' | 'installation' | 'system';
  actorPublicId: string | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityPublicId: string | null;
  data: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}
