import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { email, form, FormField, min, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import CreateSubscriptionFormInterface from '@model/create-subscription-form.interface';
import CreateSubscriptionRequestInterface from '@model/create-subscription-request.interface';
import CreateSubscriptionResponseInterface from '@model/create-subscription-response.interface';
import SubscriptionService from '@services/subscription.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-subscription-dialog',
  imports: [FormField, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './create-subscription-dialog.html',
  styleUrl: './create-subscription-dialog.scss',
})
export default class CreateSubscriptionDialog {
  private readonly subscriptionService: SubscriptionService = inject(SubscriptionService);
  private readonly dialogRef: MatDialogRef<CreateSubscriptionDialog, boolean> =
    inject(MatDialogRef);

  private readonly initialModel: CreateSubscriptionFormInterface = {
    name: '',
    contactEmail: '',
    expiresAt: '',
    maxInstallations: 1,
    maxBackupsPerInstallation: 6,
  };

  readonly formModel: WritableSignal<CreateSubscriptionFormInterface> = signal({
    ...this.initialModel,
  });
  readonly serverError: WritableSignal<string | null> = signal(null);

  readonly subscriptionForm = form(this.formModel, (path) => {
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
  });

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.serverError.set(null);

    try {
      await submit(this.subscriptionForm, async () => {
        const data: CreateSubscriptionFormInterface = this.formModel();
        const request: CreateSubscriptionRequestInterface = {
          name: data.name.trim(),
          contactEmail: data.contactEmail.trim() === '' ? null : data.contactEmail.trim(),
          expiresAt: data.expiresAt === '' ? null : data.expiresAt,
          maxInstallations: data.maxInstallations,
          maxBackupsPerInstallation: data.maxBackupsPerInstallation,
        };

        const response: CreateSubscriptionResponseInterface = await firstValueFrom(
          this.subscriptionService.create(request),
        );

        if (response.status !== 'ok') {
          throw new Error(response.message || 'No se ha podido crear la suscripción.');
        }

        this.dialogRef.close(true);
      });
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 400) {
        this.serverError.set('Revisa los datos introducidos.');
        return;
      }

      if (error instanceof Error && error.message !== '') {
        this.serverError.set(error.message);
        return;
      }

      this.serverError.set('No se ha podido crear la suscripción.');
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
