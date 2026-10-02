import { Clipboard } from '@angular/cdk/clipboard';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FieldTree, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import CreateInstallationRequestInterface from '@model/create-installation-request.interface';
import CreateInstallationResponseInterface from '@model/create-installation-response.interface';
import GetSubscriptionsResponseInterface from '@model/get-subscriptions-response.interface';
import InstallationDialogDataInterface from '@model/installation-dialog-data.interface';
import InstallationFormInterface from '@model/installation-form.interface';
import InstallationInterface from '@model/installation.interface';
import SubscriptionInterface from '@model/subscription.interface';
import UpdateInstallationRequestInterface from '@model/update-installation-request.interface';
import UpdateInstallationResponseInterface from '@model/update-installation-response.interface';
import InstallationService from '@services/installation.service';
import SubscriptionService from '@services/subscription.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-installation-dialog',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatError,
    MatFormField,
    MatHint,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatProgressSpinner,
    MatSelect,
    MatTooltip,
  ],
  templateUrl: './installation-dialog.html',
  styleUrl: './installation-dialog.scss',
})
export default class InstallationDialog implements OnInit {
  private readonly installationService: InstallationService = inject(InstallationService);
  private readonly subscriptionService: SubscriptionService = inject(SubscriptionService);
  private readonly clipboard: Clipboard = inject(Clipboard);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialogRef: MatDialogRef<InstallationDialog, boolean> = inject(MatDialogRef);
  private readonly dialogData: InstallationDialogDataInterface =
    inject<InstallationDialogDataInterface>(MAT_DIALOG_DATA);

  private readonly installation: InstallationInterface | null = this.dialogData.installation;

  readonly editing: boolean = this.installation !== null;
  readonly dialogTitle: string = this.editing ? 'Editar instalación' : 'Nueva instalación';
  readonly submitLabel: string = this.editing ? 'Guardar cambios' : 'Crear instalación';
  readonly submittingLabel: string = this.editing ? 'Guardando...' : 'Creando...';

  readonly subscriptions: WritableSignal<SubscriptionInterface[]> = signal([]);
  readonly subscriptionsLoading: WritableSignal<boolean> = signal(false);
  readonly subscriptionsError: WritableSignal<string | null> = signal(null);

  readonly createdCredential: WritableSignal<{
    keyId: string;
    secret: string;
  } | null> = signal(null);

  private readonly formModel: WritableSignal<InstallationFormInterface> = signal({
    subscriptionPublicId: this.installation?.subscriptionPublicId ?? '',
    name: this.installation?.name ?? '',
  });

  readonly installationForm: FieldTree<InstallationFormInterface> = form(
    this.formModel,
    (path) => {
      required(path.subscriptionPublicId, {
        message: 'La suscripción es obligatoria.',
      });

      required(path.name, {
        message: 'El nombre es obligatorio.',
      });
    },
    {
      submission: {
        action: async (field) => {
          const data: InstallationFormInterface = field().value();

          try {
            if (this.editing) {
              const response: UpdateInstallationResponseInterface =
                await this.updateInstallation(data);

              if (response.status !== 'ok') {
                return {
                  kind: 'server',
                  message: response.message || 'No se ha podido guardar la instalación.',
                };
              }

              this.dialogRef.close(true);

              return undefined;
            }

            const response: CreateInstallationResponseInterface =
              await this.createInstallation(data);

            if (response.status !== 'ok') {
              return {
                kind: 'server',
                message: response.message || 'No se ha podido crear la instalación.',
              };
            }

            this.createdCredential.set({
              keyId: response.credential.keyId,
              secret: response.credential.secret,
            });

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
                message: 'La suscripción o instalación ya no existe.',
              };
            }

            if (error instanceof HttpErrorResponse && error.status === 409) {
              return {
                kind: 'capacity',
                message: 'La suscripción ha alcanzado su máximo de instalaciones.',
              };
            }

            return {
              kind: 'server',
              message: 'No se ha podido guardar la instalación.',
            };
          }
        },
      },
    },
  );

  /**
   * Loads subscriptions when creating a new installation.
   *
   * @returns void
   */
  ngOnInit(): void {
    if (!this.editing) {
      this.loadSubscriptions();
    }
  }

  /**
   * Loads subscriptions available for installation creation.
   *
   * @returns void
   */
  loadSubscriptions(): void {
    this.subscriptionsLoading.set(true);
    this.subscriptionsError.set(null);

    this.subscriptionService.getAll().subscribe({
      next: (response: GetSubscriptionsResponseInterface) => {
        if (response.status !== 'ok') {
          this.subscriptionsError.set('No se han podido cargar las suscripciones.');
          this.subscriptionsLoading.set(false);
          return;
        }

        this.subscriptions.set(response.list);
        this.subscriptionsLoading.set(false);
      },
      error: () => {
        this.subscriptionsError.set('No se han podido cargar las suscripciones.');
        this.subscriptionsLoading.set(false);
      },
    });
  }

  /**
   * Closes the dialog without saving changes.
   *
   * @returns void
   */
  cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Closes the dialog after the generated credential has been reviewed.
   *
   * @returns void
   */
  finishCreation(): void {
    this.dialogRef.close(true);
  }

  /**
   * Copies a credential value to the clipboard.
   *
   * @param value Value to copy.
   * @param label Human-readable value label.
   *
   * @returns void
   */
  copyCredential(value: string, label: string): void {
    if (!this.clipboard.copy(value)) {
      this.snackBar.open(`No se ha podido copiar ${label}.`, 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    this.snackBar.open(`${label} copiado.`, 'Cerrar', {
      duration: 2500,
    });
  }

  /**
   * Creates a new installation using the current form values.
   *
   * @param data Current installation form values.
   *
   * @returns Promise resolved with the API response.
   */
  private async createInstallation(
    data: InstallationFormInterface,
  ): Promise<CreateInstallationResponseInterface> {
    const request: CreateInstallationRequestInterface = {
      subscriptionPublicId: data.subscriptionPublicId,
      name: data.name.trim(),
    };

    return firstValueFrom(this.installationService.create(request));
  }

  /**
   * Updates the installation represented by the dialog.
   *
   * @param data Current installation form values.
   *
   * @returns Promise resolved with the API response.
   */
  private async updateInstallation(
    data: InstallationFormInterface,
  ): Promise<UpdateInstallationResponseInterface> {
    if (this.installation === null) {
      throw new Error('Installation is required for update.');
    }

    const request: UpdateInstallationRequestInterface = {
      publicId: this.installation.publicId,
      name: data.name.trim(),
    };

    return firstValueFrom(this.installationService.update(request));
  }
}
