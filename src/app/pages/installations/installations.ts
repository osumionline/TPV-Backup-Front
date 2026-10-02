import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
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
import GetInstallationsResponseInterface from '@model/get-installations-response.interface';
import InstallationInterface from '@model/installation.interface';
import InstallationService from '@services/installation.service';

@Component({
  selector: 'app-installations',
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

  readonly installations: WritableSignal<InstallationInterface[]> = signal([]);
  readonly loading: WritableSignal<boolean> = signal(true);
  readonly error: WritableSignal<string | null> = signal(null);

  readonly displayedColumns: string[] = [
    'name',
    'subscription',
    'status',
    'credential',
    'lastSeen',
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
}
