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
import SubscriptionDialog from '@components/subscription-dialog/subscription-dialog';
import GetSubscriptionsResponseInterface from '@model/get-subscriptions-response.interface';
import SubscriptionDialogDataInterface from '@model/subscription-dialog-data.interface';
import SubscriptionInterface from '@model/subscription.interface';
import SubscriptionService from '@services/subscription.service';

@Component({
  selector: 'app-subscriptions',
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
  ],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.scss',
})
export default class Subscriptions implements OnInit {
  private readonly subscriptionService: SubscriptionService = inject(SubscriptionService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);

  readonly subscriptions: WritableSignal<SubscriptionInterface[]> = signal([]);
  readonly loading: WritableSignal<boolean> = signal(true);
  readonly error: WritableSignal<string | null> = signal(null);

  readonly displayedColumns: string[] = [
    'name',
    'status',
    'contactEmail',
    'expiresAt',
    'installations',
    'backups',
    'actions',
  ];

  /**
   * Loads subscriptions when the page is initialized.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.load();
  }

  /**
   * Reloads the subscriptions list from the API.
   *
   * @returns void
   */
  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.subscriptionService.getAll().subscribe({
      next: (response: GetSubscriptionsResponseInterface) => {
        if (response.status !== 'ok') {
          this.error.set('No se han podido cargar las suscripciones.');
          this.loading.set(false);
          return;
        }

        this.subscriptions.set(response.list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se han podido cargar las suscripciones.');
        this.loading.set(false);
      },
    });
  }

  /**
   * Opens the subscription dialog in creation mode.
   *
   * @returns void
   */
  openCreateDialog(): void {
    this.openSubscriptionDialog(null);
  }

  /**
   * Opens the subscription dialog in edition mode.
   *
   * @param subscription Subscription to edit.
   *
   * @returns void
   */
  openEditDialog(subscription: SubscriptionInterface): void {
    this.openSubscriptionDialog(subscription);
  }

  /**
   * Opens the shared subscription dialog and reloads the list after a successful save.
   *
   * @param subscription Subscription to edit or null to create a new one.
   *
   * @returns void
   */
  private openSubscriptionDialog(subscription: SubscriptionInterface | null): void {
    const editing: boolean = subscription !== null;

    const data: SubscriptionDialogDataInterface = {
      subscription,
    };

    const dialogRef: MatDialogRef<SubscriptionDialog, boolean> = this.dialog.open<
      SubscriptionDialog,
      SubscriptionDialogDataInterface,
      boolean
    >(SubscriptionDialog, {
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
        editing ? 'Suscripción actualizada correctamente.' : 'Suscripción creada correctamente.',
        'Cerrar',
        {
          duration: 4000,
        },
      );

      this.load();
    });
  }
}
