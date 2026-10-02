import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { email, FieldTree, form, FormField, FormRoot, min, required } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import CreateSubscriptionRequestInterface from '@model/subscriptions/create-subscription-request.interface';
import CreateSubscriptionResponseInterface from '@model/subscriptions/create-subscription-response.interface';
import SubscriptionDialogDataInterface from '@model/subscriptions/subscription-dialog-data.interface';
import SubscriptionFormInterface from '@model/subscriptions/subscription-form.interface';
import SubscriptionInterface from '@model/subscriptions/subscription.interface';
import UpdateSubscriptionRequestInterface from '@model/subscriptions/update-subscription-request.interface';
import UpdateSubscriptionResponseInterface from '@model/subscriptions/update-subscription-response.interface';
import SubscriptionService from '@services/subscription.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-subscription-dialog',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatError,
    MatFormField,
    MatHint,
    MatInput,
    MatLabel,
    MatProgressSpinner,
    MatSuffix,
  ],
  templateUrl: './subscription-dialog.html',
  styleUrl: './subscription-dialog.scss',
})
export default class SubscriptionDialog {
  private readonly subscriptionService: SubscriptionService = inject(SubscriptionService);
  private readonly dialogRef: MatDialogRef<SubscriptionDialog, boolean> = inject(MatDialogRef);
  private readonly dialogData: SubscriptionDialogDataInterface =
    inject<SubscriptionDialogDataInterface>(MAT_DIALOG_DATA);

  private readonly subscription: SubscriptionInterface | null = this.dialogData.subscription;

  readonly editing: boolean = this.subscription !== null;
  readonly dialogTitle: string = this.editing ? 'Editar suscripción' : 'Nueva suscripción';
  readonly submitLabel: string = this.editing ? 'Guardar cambios' : 'Crear suscripción';
  readonly submittingLabel: string = this.editing ? 'Guardando...' : 'Creando...';
  readonly minimumInstallations: number = Math.max(1, this.subscription?.installationCount ?? 1);

  private readonly formModel: WritableSignal<SubscriptionFormInterface> = signal({
    name: this.subscription?.name ?? '',
    contactEmail: this.subscription?.contactEmail ?? '',
    expiresAt: this.parseDate(this.subscription?.expiresAt ?? null),
    maxInstallations: this.subscription?.maxInstallations ?? 1,
    maxBackupsPerInstallation: this.subscription?.maxBackupsPerInstallation ?? 6,
  });

  readonly subscriptionForm: FieldTree<SubscriptionFormInterface> = form(
    this.formModel,
    (path) => {
      required(path.name, {
        message: 'El nombre es obligatorio.',
      });

      email(path.contactEmail, {
        message: 'Introduce un email válido.',
      });

      min(path.maxInstallations, this.minimumInstallations, {
        message: `Debe permitirse al menos ${this.minimumInstallations} instalación(es).`,
      });

      min(path.maxBackupsPerInstallation, 1, {
        message: 'Debe conservarse al menos una copia.',
      });
    },
    {
      submission: {
        action: async (field) => {
          const data: SubscriptionFormInterface = field().value();

          try {
            const response:
              CreateSubscriptionResponseInterface | UpdateSubscriptionResponseInterface = this
              .editing
              ? await this.updateSubscription(data)
              : await this.createSubscription(data);

            if (response.status !== 'ok') {
              return {
                kind: 'server',
                message: response.message || 'No se ha podido guardar la suscripción.',
              };
            }

            this.dialogRef.close(true);

            return undefined;
          } catch (error: unknown) {
            if (error instanceof HttpErrorResponse && error.status === 400) {
              return {
                kind: 'validation',
                message: 'Revisa los datos introducidos.',
              };
            }

            if (error instanceof HttpErrorResponse && error.status === 404) {
              return {
                kind: 'not-found',
                message: 'La suscripción ya no existe.',
              };
            }

            return {
              kind: 'server',
              message: 'No se ha podido guardar la suscripción.',
            };
          }
        },
      },
    },
  );

  /**
   * Closes the dialog without saving changes.
   *
   * @returns void
   */
  cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Creates a new subscription using the current form data.
   *
   * @param data Current subscription form values.
   *
   * @returns Promise resolved with the API response.
   */
  private async createSubscription(
    data: SubscriptionFormInterface,
  ): Promise<CreateSubscriptionResponseInterface> {
    const request: CreateSubscriptionRequestInterface = {
      name: data.name.trim(),
      contactEmail: data.contactEmail.trim() === '' ? null : data.contactEmail.trim(),
      expiresAt: this.formatDate(data.expiresAt),
      maxInstallations: data.maxInstallations,
      maxBackupsPerInstallation: data.maxBackupsPerInstallation,
    };

    return firstValueFrom(this.subscriptionService.create(request));
  }

  /**
   * Updates the subscription represented by the dialog.
   *
   * @param data Current subscription form values.
   *
   * @returns Promise resolved with the API response.
   */
  private async updateSubscription(
    data: SubscriptionFormInterface,
  ): Promise<UpdateSubscriptionResponseInterface> {
    if (this.subscription === null) {
      throw new Error('Subscription is required for update.');
    }

    const request: UpdateSubscriptionRequestInterface = {
      publicId: this.subscription.publicId,
      name: data.name.trim(),
      contactEmail: data.contactEmail.trim() === '' ? null : data.contactEmail.trim(),
      expiresAt: this.formatDate(data.expiresAt),
      maxInstallations: data.maxInstallations,
      maxBackupsPerInstallation: data.maxBackupsPerInstallation,
    };

    return firstValueFrom(this.subscriptionService.update(request));
  }

  /**
   * Converts an API date in YYYY-MM-DD format into a local Date instance.
   *
   * @param value API date value or null.
   *
   * @returns Local Date instance or null when no date is defined.
   */
  private parseDate(value: string | null): Date | null {
    if (value === null) {
      return null;
    }

    const [year, month, day]: number[] = value.split('-').map(Number);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  /**
   * Converts a local Date instance into the YYYY-MM-DD format expected by the API.
   *
   * @param date Date to format or null.
   *
   * @returns Formatted date or null when no date is defined.
   */
  private formatDate(date: Date | null): string | null {
    if (date === null) {
      return null;
    }

    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
