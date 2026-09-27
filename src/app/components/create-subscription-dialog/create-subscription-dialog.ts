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
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import CreateSubscriptionFormInterface from '@model/create-subscription-form.interface';
import CreateSubscriptionRequestInterface from '@model/create-subscription-request.interface';
import CreateSubscriptionResponseInterface from '@model/create-subscription-response.interface';
import SubscriptionService from '@services/subscription.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-subscription-dialog',
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
  templateUrl: './create-subscription-dialog.html',
  styleUrl: './create-subscription-dialog.scss',
})
export default class CreateSubscriptionDialog {
  private readonly subscriptionService: SubscriptionService = inject(SubscriptionService);
  private readonly dialogRef: MatDialogRef<CreateSubscriptionDialog, boolean> =
    inject(MatDialogRef);

  private readonly formModel: WritableSignal<CreateSubscriptionFormInterface> = signal({
    name: '',
    contactEmail: '',
    expiresAt: null,
    maxInstallations: 1,
    maxBackupsPerInstallation: 5,
  });

  readonly subscriptionForm: FieldTree<CreateSubscriptionFormInterface> = form(
    this.formModel,
    (path) => {
      required(path.name, {
        message: 'El nombre es obligatorio.',
      });

      email(path.contactEmail, {
        message: 'Introduce un email válido.',
      });

      min(path.maxInstallations, 1, {
        message: 'Debe permitirse al menos una instalación.',
      });

      min(path.maxBackupsPerInstallation, 1, {
        message: 'Debe conservarse al menos una copia.',
      });
    },
    {
      submission: {
        action: async (field) => {
          const data: CreateSubscriptionFormInterface = field().value();

          const request: CreateSubscriptionRequestInterface = {
            name: data.name.trim(),
            contactEmail: data.contactEmail.trim() === '' ? null : data.contactEmail.trim(),
            expiresAt: this.formatDate(data.expiresAt),
            maxInstallations: data.maxInstallations,
            maxBackupsPerInstallation: data.maxBackupsPerInstallation,
          };

          try {
            const response: CreateSubscriptionResponseInterface = await firstValueFrom(
              this.subscriptionService.create(request),
            );

            if (response.status !== 'ok') {
              return {
                kind: 'server',
                message: response.message || 'No se ha podido crear la suscripción.',
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

            return {
              kind: 'server',
              message: 'No se ha podido crear la suscripción.',
            };
          }
        },
      },
    },
  );

  cancel(): void {
    this.dialogRef.close(false);
  }

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
