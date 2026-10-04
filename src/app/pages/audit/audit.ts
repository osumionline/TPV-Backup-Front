import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import AuditLogInterface from '@model/audit/audit-log.interface';
import GetAuditLogsResponseInterface from '@model/audit/get-audit-logs-response.interface';
import AuditLogService from '@services/audit-log.service';

@Component({
  selector: 'app-audit',
  imports: [
    MatButton,
    MatCard,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatPaginator,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatTable,
    MatTooltip,
  ],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export default class Audit implements OnInit {
  private readonly auditLogService: AuditLogService = inject(AuditLogService);

  readonly auditLogs: WritableSignal<AuditLogInterface[]> = signal([]);
  readonly loading: WritableSignal<boolean> = signal(true);
  readonly error: WritableSignal<string | null> = signal(null);

  readonly pageIndex: WritableSignal<number> = signal(0);
  readonly pageSize: WritableSignal<number> = signal(25);
  readonly total: WritableSignal<number> = signal(0);

  readonly pageSizeOptions: number[] = [10, 25, 50, 100];

  readonly displayedColumns: string[] = ['createdAt', 'actor', 'action', 'entity', 'ip', 'data'];

  /**
   * Loads the first audit page when the view is initialized.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.load();
  }

  /**
   * Loads the current audit page from the API.
   *
   * @returns void
   */
  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.auditLogService.getPage(this.pageIndex() + 1, this.pageSize()).subscribe({
      next: (response: GetAuditLogsResponseInterface) => {
        if (response.status !== 'ok') {
          this.error.set('No se ha podido cargar el registro de auditoría.');
          this.loading.set(false);
          return;
        }

        this.auditLogs.set(response.list);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se ha podido cargar el registro de auditoría.');
        this.loading.set(false);
      },
    });
  }

  /**
   * Loads a different audit page after paginator interaction.
   *
   * @param event Material paginator event.
   *
   * @returns void
   */
  pageChanged(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);

    this.load();
  }

  /**
   * Gets a human-readable actor label.
   *
   * @param auditLog Audit event.
   *
   * @returns Actor label.
   */
  actorLabel(auditLog: AuditLogInterface): string {
    switch (auditLog.actorType) {
      case 'admin':
        return auditLog.actorName === null
          ? 'Administrador'
          : `Administrador · ${auditLog.actorName}`;

      case 'installation':
        return auditLog.actorName === null ? 'Instalación' : `Instalación · ${auditLog.actorName}`;

      case 'system':
        return 'Sistema';
    }
  }

  /**
   * Gets a human-readable action label.
   *
   * @param action Audit action code.
   *
   * @returns Translated action label.
   */
  actionLabel(action: string): string {
    switch (action) {
      case 'admin.login':
        return 'Inicio de sesión';

      case 'subscription.create':
        return 'Suscripción creada';

      case 'subscription.update':
        return 'Suscripción modificada';

      case 'subscription.set_active':
        return 'Estado de suscripción modificado';

      case 'subscription.delete':
        return 'Suscripción eliminada';

      case 'installation.create':
        return 'Instalación creada';

      case 'installation.update':
        return 'Instalación modificada';

      case 'installation.set_active':
        return 'Estado de instalación modificado';

      case 'installation.delete':
        return 'Instalación eliminada';

      case 'installation.credential_rotate':
        return 'Credencial rotada';

      case 'installation.credential_revoke':
        return 'Credencial revocada';

      case 'backup.download':
        return 'Copia descargada';

      case 'backup.delete':
        return 'Copia eliminada';

      case 'backup.retention_delete':
        return 'Copia eliminada por retención';

      default:
        return action;
    }
  }

  /**
   * Gets a human-readable entity label.
   *
   * @param entityType Audit entity type.
   *
   * @returns Entity label.
   */
  entityLabel(entityType: string): string {
    switch (entityType) {
      case 'admin_user':
        return 'Administrador';

      case 'subscription':
        return 'Suscripción';

      case 'installation':
        return 'Instalación';

      case 'backup':
        return 'Copia';

      default:
        return entityType;
    }
  }

  /**
   * Formats an audit timestamp for display.
   *
   * @param value Timestamp in Y-m-d H:i:s format.
   *
   * @returns Human-readable timestamp.
   */
  formatDate(value: string): string {
    const match: RegExpMatchArray | null = value.match(
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
    );

    if (match === null) {
      return value;
    }

    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
  }

  /**
   * Formats JSON audit metadata for compact display.
   *
   * @param data Encoded audit metadata.
   *
   * @returns Compact readable metadata.
   */
  formatData(data: string | null): string {
    if (data === null || data === '') {
      return '—';
    }

    try {
      const decoded: unknown = JSON.parse(data);
      const encoded: string | undefined = JSON.stringify(decoded);

      return encoded ?? data;
    } catch {
      return data;
    }
  }
}
