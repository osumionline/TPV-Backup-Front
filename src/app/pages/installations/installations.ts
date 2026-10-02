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
import InstallationDialog from '@components/installation-dialog/installation-dialog';
import ConfirmDialogDataInterface from '@model/confirm-dialog-data.interface';
import DeleteInstallationRequestInterface from '@model/delete-installation-request.interface';
import DeleteInstallationResponseInterface from '@model/delete-installation-response.interface';
import GetInstallationsResponseInterface from '@model/get-installations-response.interface';
import InstallationDialogDataInterface from '@model/installation-dialog-data.interface';
import InstallationInterface from '@model/installation.interface';
import SetInstallationActiveRequestInterface from '@model/set-installation-active-request.interface';
import SetInstallationActiveResponseInterface from '@model/set-installation-active-response.interface';
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
