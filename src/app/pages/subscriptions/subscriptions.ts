import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import CreateSubscriptionDialog from '@components/create-subscription-dialog/create-subscription-dialog';
import GetSubscriptionsResponseInterface from '@model/get-subscriptions-response.interface';
import SubscriptionInterface from '@model/subscription.interface';
import SubscriptionService from '@services/subscription.service';

@Component({
  selector: 'app-subscriptions',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
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
  ];

  ngOnInit(): void {
    this.load();
  }

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

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateSubscriptionDialog, {
      width: '640px',
      maxWidth: 'calc(100vw - 32px)',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((created: boolean | undefined) => {
      if (created !== true) {
        return;
      }

      this.snackBar.open('Suscripción creada correctamente.', 'Cerrar', {
        duration: 4000,
      });
      this.load();
    });
  }
}
