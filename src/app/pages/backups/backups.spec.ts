import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import BackupDownloadInterface from '@model/backups/backup-download.interface';
import BackupInterface from '@model/backups/backup.interface';
import DeleteBackupResponseInterface from '@model/backups/delete-backup-response.interface';
import GetBackupsResponseInterface from '@model/backups/get-backups-response.interface';
import Backups from '@pages/backups/backups';
import BackupService from '@services/backup.service';
import { of } from 'rxjs';

describe('Backups', () => {
  const backup: BackupInterface = {
    publicId: '9c9759fa-2a34-435b-96eb-7843f2e0d6de',
    installationPublicId: '8a8758ea-5052-4c71-bd77-679509addead',
    installationName: 'TPV Principal',
    subscriptionPublicId: 'subscription-public-id',
    subscriptionName: 'Suscripción principal',
    backupId: '2dcc0f83-98a8-484b-819e-6027f43da601',
    createdAtClient: '2026-09-24 21:24:37',
    formatVersion: 3,
    application: 'Osumi TPV Client',
    applicationVersion: '21.3.0',
    databaseSchemaVersion: 1,
    originalFilename: 'osumi-tpv-backup.otpv',
    sizeBytes: 18864215,
    sha256: 'ba6bbeacff9acf8c822ca0f451f72af5b69a287acf7f12af8f6ed1de94470919',
    createdAt: '2026-10-03 22:00:00',
    updatedAt: '2026-10-03 22:00:00',
  };

  const getAllResponse: GetBackupsResponseInterface = {
    status: 'ok',
    list: [backup],
  };

  const deleteResponse: DeleteBackupResponseInterface = {
    status: 'ok',
    publicId: backup.publicId,
    message: '',
  };

  const backupService = {
    getAll: vi.fn(() => of(getAllResponse)),
    download: vi.fn(),
    delete: vi.fn(() => of(deleteResponse)),
  };

  const dialog = {
    open: vi.fn(),
  };

  const snackBar = {
    open: vi.fn(),
  };

  let fixture: ComponentFixture<Backups>;
  let component: Backups;

  beforeEach(async () => {
    vi.clearAllMocks();

    backupService.getAll.mockReturnValue(of(getAllResponse));
    backupService.delete.mockReturnValue(of(deleteResponse));

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:test-backup'),
    });

    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });

    await TestBed.configureTestingModule({
      imports: [Backups],
      providers: [
        {
          provide: BackupService,
          useValue: backupService,
        },
        {
          provide: MatDialog,
          useValue: dialog,
        },
        {
          provide: MatSnackBar,
          useValue: snackBar,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Backups);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    vi.restoreAllMocks();
  });

  /**
   * Verifies that backups are loaded from the API.
   *
   * @returns void
   */
  it('should load backups', (): void => {
    component.load();

    expect(backupService.getAll).toHaveBeenCalledTimes(1);
    expect(component.backups()).toEqual([backup]);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  /**
   * Verifies that a downloaded blob starts a browser file download.
   *
   * @returns void
   */
  it('should download a backup', (): void => {
    const blob: Blob = new Blob(['backup-data'], {
      type: 'application/octet-stream',
    });

    const download: BackupDownloadInterface = {
      blob,
      filename: backup.originalFilename,
    };

    backupService.download.mockReturnValue(of(download));

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    component.download(backup);

    expect(backupService.download).toHaveBeenCalledWith(backup.publicId);
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-backup');
    expect(component.downloadingPublicId()).toBeNull();
  });

  /**
   * Verifies that a confirmed backup deletion removes it from the list.
   *
   * @returns void
   */
  it('should delete a confirmed backup', (): void => {
    component.backups.set([backup]);

    dialog.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.confirmDelete(backup);

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(backupService.delete).toHaveBeenCalledWith({
      publicId: backup.publicId,
    });
    expect(component.backups()).toEqual([]);
    expect(component.deletingPublicId()).toBeNull();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Copia de seguridad eliminada correctamente.',
      'Cerrar',
      {
        duration: 4000,
      },
    );
  });

  /**
   * Verifies the human-readable backup size formatting.
   *
   * @returns void
   */
  it('should format backup sizes', (): void => {
    expect(component.formatSize(512)).toBe('512 B');
    expect(component.formatSize(1024)).toBe('1 KB');
    expect(component.formatSize(1048576)).toBe('1 MB');
  });

  /**
   * Verifies the API timestamp display formatting.
   *
   * @returns void
   */
  it('should format backup dates', (): void => {
    expect(component.formatDate('2026-09-24 21:24:37')).toBe('24/09/2026 21:24');
  });
});
