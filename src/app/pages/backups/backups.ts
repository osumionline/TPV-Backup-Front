import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import ConfirmDialog from '@components/confirm-dialog/confirm-dialog';
import BackupDownloadInterface from '@model/backups/backup-download.interface';
import BackupInterface from '@model/backups/backup.interface';
import DeleteBackupRequestInterface from '@model/backups/delete-backup-request.interface';
import DeleteBackupResponseInterface from '@model/backups/delete-backup-response.interface';
import GetBackupsResponseInterface from '@model/backups/get-backups-response.interface';
import ConfirmDialogDataInterface from '@model/common/confirm-dialog-data.interface';
import BackupService from '@services/backup.service';

@Component({
  selector: 'app-backups',
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
    MatIconButton,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatTable,
    MatTooltip,
  ],
  templateUrl: './backups.html',
  styleUrl: './backups.scss',
})
export default class Backups implements OnInit {
  private readonly backupService: BackupService = inject(BackupService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly document: Document = inject(DOCUMENT);

  readonly backups: WritableSignal<BackupInterface[]> = signal([]);
  readonly loading: WritableSignal<boolean> = signal(true);
  readonly error: WritableSignal<string | null> = signal(null);
  readonly downloadingPublicId: WritableSignal<string | null> = signal(null);
  readonly deletingPublicId: WritableSignal<string | null> = signal(null);

  readonly displayedColumns: string[] = [
    'backup',
    'installation',
    'subscription',
    'createdAt',
    'version',
    'schema',
    'size',
    'actions',
  ];

  /**
   * Loads backups when the page is initialized.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.load();
  }

  /**
   * Reloads the backups list from the API.
   *
   * @returns void
   */
  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.backupService.getAll().subscribe({
      next: (response: GetBackupsResponseInterface) => {
        if (response.status !== 'ok') {
          this.error.set('No se han podido cargar las copias de seguridad.');
          this.loading.set(false);
          return;
        }

        this.backups.set(response.list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se han podido cargar las copias de seguridad.');
        this.loading.set(false);
      },
    });
  }

  /**
   * Downloads a backup and starts the browser file download.
   *
   * @param backup Backup to download.
   *
   * @returns void
   */
  download(backup: BackupInterface): void {
    if (this.downloadingPublicId() !== null) {
      return;
    }

    this.downloadingPublicId.set(backup.publicId);

    this.backupService.download(backup.publicId).subscribe({
      next: (download: BackupDownloadInterface) => {
        this.downloadingPublicId.set(null);

        this.saveDownload(download);
      },
      error: (error: unknown) => {
        this.downloadingPublicId.set(null);

        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.snackBar.open('La copia de seguridad ya no existe.', 'Cerrar', {
            duration: 4000,
          });

          this.load();
          return;
        }

        this.snackBar.open('No se ha podido descargar la copia de seguridad.', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }

  /**
   * Opens a confirmation dialog before deleting a backup.
   *
   * @param backup Backup to delete.
   *
   * @returns void
   */
  confirmDelete(backup: BackupInterface): void {
    if (this.deletingPublicId() !== null) {
      return;
    }

    const installationName: string = backup.installationName ?? 'instalación desconocida';

    const data: ConfirmDialogDataInterface = {
      title: 'Eliminar copia de seguridad',
      message:
        `¿Quieres eliminar definitivamente la copia "${backup.originalFilename}" ` +
        `de "${installationName}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
    };

    const dialogRef: MatDialogRef<ConfirmDialog, boolean> = this.dialog.open<
      ConfirmDialog,
      ConfirmDialogDataInterface,
      boolean
    >(ConfirmDialog, {
      width: '480px',
      maxWidth: 'calc(100vw - 32px)',
      data,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed === true) {
        this.deleteBackup(backup);
      }
    });
  }

  /**
   * Formats a backup size using binary units.
   *
   * @param sizeBytes Backup size in bytes.
   *
   * @returns Human-readable backup size.
   */
  formatSize(sizeBytes: number): string {
    if (sizeBytes < 1024) {
      return `${sizeBytes} B`;
    }

    const units: string[] = ['KB', 'MB', 'GB', 'TB'];

    let value: number = sizeBytes / 1024;
    let unitIndex: number = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: 1,
    }).format(value)} ${units[unitIndex]}`;
  }

  /**
   * Formats the API database timestamp for display.
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
   * Deletes a backup after confirmation.
   *
   * @param backup Backup to delete.
   *
   * @returns void
   */
  private deleteBackup(backup: BackupInterface): void {
    if (this.deletingPublicId() !== null) {
      return;
    }

    const request: DeleteBackupRequestInterface = {
      publicId: backup.publicId,
    };

    this.deletingPublicId.set(backup.publicId);

    this.backupService.delete(request).subscribe({
      next: (response: DeleteBackupResponseInterface) => {
        this.deletingPublicId.set(null);

        if (response.status !== 'ok') {
          this.snackBar.open('No se ha podido eliminar la copia de seguridad.', 'Cerrar', {
            duration: 4000,
          });
          return;
        }

        this.backups.update((backups: BackupInterface[]) =>
          backups.filter(
            (currentBackup: BackupInterface) => currentBackup.publicId !== backup.publicId,
          ),
        );

        this.snackBar.open('Copia de seguridad eliminada correctamente.', 'Cerrar', {
          duration: 4000,
        });
      },
      error: (error: unknown) => {
        this.deletingPublicId.set(null);

        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.snackBar.open('La copia de seguridad ya no existe.', 'Cerrar', {
            duration: 4000,
          });

          this.load();
          return;
        }

        this.snackBar.open('No se ha podido eliminar la copia de seguridad.', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }

  /**
   * Starts a browser download for a received backup blob.
   *
   * @param download Downloaded backup data.
   *
   * @returns void
   */
  private saveDownload(download: BackupDownloadInterface): void {
    const objectUrl: string = URL.createObjectURL(download.blob);

    const anchor: HTMLAnchorElement = this.document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = download.filename;
    anchor.style.display = 'none';

    this.document.body.appendChild(anchor);

    try {
      anchor.click();
    } finally {
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    }
  }
}
