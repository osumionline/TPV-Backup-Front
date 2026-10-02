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
import InstallationDialog from '@components/installation-dialog/installation-dialog';
import GetInstallationsResponseInterface from '@model/get-installations-response.interface';
import InstallationDialogDataInterface from '@model/installation-dialog-data.interface';
import InstallationInterface from '@model/installation.interface';
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
