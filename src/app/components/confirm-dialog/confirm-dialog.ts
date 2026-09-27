import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import ConfirmDialogDataInterface from '@model/confirm-dialog-data.interface';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButton, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  templateUrl: './confirm-dialog.html',
})
export default class ConfirmDialog {
  readonly data: ConfirmDialogDataInterface = inject<ConfirmDialogDataInterface>(MAT_DIALOG_DATA);
}
