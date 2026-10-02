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
import InstallationCredentialDialog from '@components/installation-credential-dialog/installation-credential-dialog';
import InstallationDialog from '@components/installation-dialog/installation-dialog';
import ConfirmDialogDataInterface from '@model/common/confirm-dialog-data.interface';
import InstallationCredentialDialogDataInterface from '@model/installations/credentials/installation-credential-dialog-data.interface';
import InstallationCredentialRequestInterface from '@model/installations/credentials/installation-credential-request.interface';
import RevokeInstallationCredentialResponseInterface from '@model/installations/credentials/revoke-installation-credential-response.interface';
import RotateInstallationCredentialResponseInterface from '@model/installations/credentials/rotate-installation-credential-response.interface';
import DeleteInstallationRequestInterface from '@model/installations/delete-installation-request.interface';
import DeleteInstallationResponseInterface from '@model/installations/delete-installation-response.interface';
import GetInstallationsResponseInterface from '@model/installations/get-installations-response.interface';
import InstallationDialogDataInterface from '@model/installations/installation-dialog-data.interface';
import InstallationInterface from '@model/installations/installation.interface';
import SetInstallationActiveRequestInterface from '@model/installations/set-installation-active-request.interface';
import SetInstallationActiveResponseInterface from '@model/installations/set-installation-active-response.interface';
import InstallationService from '@services/installation.service';

@Component({
  selector: 'app-installations',
  imports: [
    MatButton,
    MatIconButton,
    MatTooltip,
    MatCard,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatProgressSpinner,
    MatRow,
    MatRowDef,
    MatTable,
  ],
  templateUrl: './installations.html',
  styleUrl: './installations.scss',
})
export default class Installations implements OnInit {
  private readonly installationService: InstallationService = inject(InstallationService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);

  readonly installations: WritableSignal<InstallationInterface[]> = signal([]);
  readonly loading: WritableSignal<boolean> = signal(true);
  readonly error: WritableSignal<string | null> = signal(null);
  readonly changingActivePublicId: WritableSignal<string | null> = signal(null);
  readonly deletingPublicId: WritableSignal<string | null> = signal(null);
  readonly credentialActionPublicId: WritableSignal<string | null> = signal(null);

  readonly displayedColumns: string[] = [
    'name',
    'subscription',
    'status',
    'credential',
    'lastSeen',
    'actions',
  ];

  /**
   * Loads installations when the page is initialized.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.load();
  }

  /**
   * Reloads the installations list from the API.
   *
   * @returns void
   */
  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.installationService.getAll().subscribe({
      next: (response: GetInstallationsResponseInterface) => {
        if (response.status !== 'ok') {
          this.error.set('No se han podido cargar las instalaciones.');
          this.loading.set(false);
          return;
        }

        this.installations.set(response.list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se han podido cargar las instalaciones.');
        this.loading.set(false);
      },
    });
  }

  /**
   * Opens the installation dialog in creation mode.
   *
   * @returns void
   */
  openCreateDialog(): void {
    this.openInstallationDialog(null);
  }

  /**
   * Opens the installation dialog in edition mode.
   *
   * @param installation Installation to edit.
   *
   * @returns void
   */
  openEditDialog(installation: InstallationInterface): void {
    this.openInstallationDialog(installation);
  }

  /**
   * Enables a disabled installation.
   *
   * @param installation Installation to enable.
   *
   * @returns void
   */
  activate(installation: InstallationInterface): void {
    this.changeActiveState(installation, true);
  }

  /**
   * Opens a confirmation dialog before disabling an installation.
   *
   * @param installation Installation to disable.
   *
   * @returns void
   */
  confirmDeactivate(installation: InstallationInterface): void {
    const data: ConfirmDialogDataInterface = {
      title: 'Desactivar instalación',
      message:
        `¿Quieres desactivar la instalación "${installation.name}"? ` +
        'Dejará de poder utilizar la API remota mientras permanezca desactivada.',
      confirmLabel: 'Desactivar',
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
        this.changeActiveState(installation, false);
      }
    });
  }

  /**
   * Opens a confirmation dialog before deleting an installation.
   *
   * @param installation Installation to delete.
   *
   * @returns void
   */
  confirmDelete(installation: InstallationInterface): void {
    const data: ConfirmDialogDataInterface = {
      title: 'Eliminar instalación',
      message:
        `¿Quieres eliminar definitivamente la instalación "${installation.name}"? ` +
        'Sus credenciales también se eliminarán. Esta acción no se puede deshacer.',
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
        this.deleteInstallation(installation);
      }
    });
  }

  /**
   * Opens a confirmation dialog before revoking the active installation credential.
   *
   * @param installation Installation whose credential must be revoked.
   *
   * @returns void
   */
  confirmRevokeCredential(installation: InstallationInterface): void {
    const data: ConfirmDialogDataInterface = {
      title: 'Revocar credencial',
      message:
        `¿Quieres revocar la credencial activa de "${installation.name}"? ` +
        'La instalación dejará de poder autenticarse hasta que generes una nueva credencial.',
      confirmLabel: 'Revocar',
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
        this.revokeCredential(installation);
      }
    });
  }

  /**
   * Opens a confirmation dialog before rotating an active installation credential.
   *
   * @param installation Installation whose credential must be rotated.
   *
   * @returns void
   */
  confirmRotateCredential(installation: InstallationInterface): void {
    const data: ConfirmDialogDataInterface = {
      title: 'Rotar credencial',
      message:
        `¿Quieres generar una nueva credencial para "${installation.name}"? ` +
        'La credencial actual quedará revocada inmediatamente.',
      confirmLabel: 'Rotar',
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
        this.rotateCredential(installation);
      }
    });
  }

  /**
   * Generates a credential for an installation that currently has none.
   *
   * @param installation Installation that needs a new credential.
   *
   * @returns void
   */
  generateCredential(installation: InstallationInterface): void {
    this.rotateCredential(installation);
  }

  /**
   * Deletes an installation from the API and reloads the installations list.
   *
   * @param installation Installation to delete.
   *
   * @returns void
   */
  private deleteInstallation(installation: InstallationInterface): void {
    if (this.deletingPublicId() !== null) {
      return;
    }

    const request: DeleteInstallationRequestInterface = {
      publicId: installation.publicId,
    };

    this.deletingPublicId.set(installation.publicId);

    this.installationService.delete(request).subscribe({
      next: (response: DeleteInstallationResponseInterface) => {
        this.deletingPublicId.set(null);

        if (response.status !== 'ok') {
          this.snackBar.open('No se ha podido eliminar la instalación.', 'Cerrar', {
            duration: 4000,
          });
          return;
        }

        this.snackBar.open('Instalación eliminada correctamente.', 'Cerrar', {
          duration: 4000,
        });

        this.load();
      },
      error: (error: unknown) => {
        this.deletingPublicId.set(null);

        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.snackBar.open(
            'No se puede eliminar una instalación que tenga copias de seguridad.',
            'Cerrar',
            {
              duration: 5000,
            },
          );
          this.load();
          return;
        }

        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.snackBar.open('La instalación ya no existe.', 'Cerrar', {
            duration: 4000,
          });
          this.load();
          return;
        }

        this.snackBar.open('No se ha podido eliminar la instalación.', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }

  /**
   * Changes the administrative active state of an installation.
   *
   * @param installation Installation to update.
   * @param active Desired active state.
   *
   * @returns void
   */
  private changeActiveState(installation: InstallationInterface, active: boolean): void {
    if (this.changingActivePublicId() !== null) {
      return;
    }

    const request: SetInstallationActiveRequestInterface = {
      publicId: installation.publicId,
      active,
    };

    this.changingActivePublicId.set(installation.publicId);

    this.installationService.setActive(request).subscribe({
      next: (response: SetInstallationActiveResponseInterface) => {
        this.changingActivePublicId.set(null);

        if (response.status !== 'ok') {
          this.snackBar.open('No se ha podido cambiar el estado de la instalación.', 'Cerrar', {
            duration: 4000,
          });
          return;
        }

        this.snackBar.open(
          active ? 'Instalación activada correctamente.' : 'Instalación desactivada correctamente.',
          'Cerrar',
          {
            duration: 4000,
          },
        );

        this.load();
      },
      error: (error: unknown) => {
        this.changingActivePublicId.set(null);

        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.snackBar.open('La instalación ya no existe.', 'Cerrar', {
            duration: 4000,
          });
          this.load();
          return;
        }

        this.snackBar.open('No se ha podido cambiar el estado de la instalación.', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }

  /**
   * Revokes the active credential of an installation.
   *
   * @param installation Installation whose credential must be revoked.
   *
   * @returns void
   */
  private revokeCredential(installation: InstallationInterface): void {
    if (this.credentialActionPublicId() !== null) {
      return;
    }

    const request: InstallationCredentialRequestInterface = {
      publicId: installation.publicId,
    };

    this.credentialActionPublicId.set(installation.publicId);

    this.installationService.revokeCredential(request).subscribe({
      next: (response: RevokeInstallationCredentialResponseInterface) => {
        this.credentialActionPublicId.set(null);

        if (response.status !== 'ok') {
          this.snackBar.open('No se ha podido revocar la credencial.', 'Cerrar', {
            duration: 4000,
          });
          return;
        }

        this.snackBar.open(
          response.revokedCount > 0
            ? 'Credencial revocada correctamente.'
            : 'La instalación ya no tenía una credencial activa.',
          'Cerrar',
          {
            duration: 4000,
          },
        );

        this.load();
      },
      error: (error: unknown) => {
        this.credentialActionPublicId.set(null);

        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.snackBar.open('La instalación ya no existe.', 'Cerrar', {
            duration: 4000,
          });
          this.load();
          return;
        }

        this.snackBar.open('No se ha podido revocar la credencial.', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }

  /**
   * Rotates or generates the active credential of an installation.
   *
   * @param installation Installation whose credential must be generated.
   *
   * @returns void
   */
  private rotateCredential(installation: InstallationInterface): void {
    if (this.credentialActionPublicId() !== null) {
      return;
    }

    const hadActiveCredential: boolean = installation.hasActiveCredential;

    const request: InstallationCredentialRequestInterface = {
      publicId: installation.publicId,
    };

    this.credentialActionPublicId.set(installation.publicId);

    this.installationService.rotateCredential(request).subscribe({
      next: (response: RotateInstallationCredentialResponseInterface) => {
        this.credentialActionPublicId.set(null);

        if (response.status !== 'ok') {
          this.snackBar.open('No se ha podido generar la credencial.', 'Cerrar', {
            duration: 4000,
          });
          return;
        }

        this.openCredentialDialog(
          response.credential.keyId,
          response.credential.secret,
          hadActiveCredential,
        );
      },
      error: (error: unknown) => {
        this.credentialActionPublicId.set(null);

        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.snackBar.open('La instalación ya no existe.', 'Cerrar', {
            duration: 4000,
          });
          this.load();
          return;
        }

        this.snackBar.open('No se ha podido generar la credencial.', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }

  /**
   * Shows a newly generated installation credential.
   *
   * @param keyId Public identifier of the credential.
   * @param secret Secret value shown only once.
   * @param rotated Whether an existing credential has been replaced.
   *
   * @returns void
   */
  private openCredentialDialog(keyId: string, secret: string, rotated: boolean): void {
    const data: InstallationCredentialDialogDataInterface = {
      title: rotated ? 'Credencial rotada' : 'Credencial generada',
      message: rotated
        ? 'La credencial anterior ha quedado revocada y esta es la nueva credencial activa.'
        : 'La instalación ya dispone de una nueva credencial activa.',
      keyId,
      secret,
    };

    const dialogRef: MatDialogRef<InstallationCredentialDialog, void> = this.dialog.open<
      InstallationCredentialDialog,
      InstallationCredentialDialogDataInterface,
      void
    >(InstallationCredentialDialog, {
      width: '640px',
      maxWidth: 'calc(100vw - 32px)',
      disableClose: true,
      data,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.load();
    });
  }

  /**
   * Opens the shared installation dialog and reloads the list after a successful save.
   *
   * @param installation Installation to edit or null to create a new one.
   *
   * @returns void
   */
  private openInstallationDialog(installation: InstallationInterface | null): void {
    const editing: boolean = installation !== null;

    const data: InstallationDialogDataInterface = {
      installation,
    };

    const dialogRef: MatDialogRef<InstallationDialog, boolean> = this.dialog.open<
      InstallationDialog,
      InstallationDialogDataInterface,
      boolean
    >(InstallationDialog, {
      width: '640px',
      maxWidth: 'calc(100vw - 32px)',
      disableClose: true,
      data,
    });

    dialogRef.afterClosed().subscribe((saved: boolean | undefined) => {
      if (saved !== true) {
        return;
      }

      this.snackBar.open(
        editing ? 'Instalación actualizada correctamente.' : 'Instalación creada correctamente.',
        'Cerrar',
        {
          duration: 4000,
        },
      );

      this.load();
    });
  }
}
