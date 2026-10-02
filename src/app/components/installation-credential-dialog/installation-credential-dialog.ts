import { Clipboard } from '@angular/cdk/clipboard';
import { Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import InstallationCredentialDialogDataInterface from '@model/installations/credentials/installation-credential-dialog-data.interface';

@Component({
  selector: 'app-installation-credential-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
    MatTooltip,
  ],
  templateUrl: './installation-credential-dialog.html',
  styleUrl: './installation-credential-dialog.scss',
})
export default class InstallationCredentialDialog {
  private readonly clipboard: Clipboard = inject(Clipboard);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialogRef: MatDialogRef<InstallationCredentialDialog, void> =
    inject(MatDialogRef);

  readonly data: InstallationCredentialDialogDataInterface =
    inject<InstallationCredentialDialogDataInterface>(MAT_DIALOG_DATA);

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
   * Closes the dialog after the credential has been reviewed.
   *
   * @returns void
   */
  close(): void {
    this.dialogRef.close();
  }
}
