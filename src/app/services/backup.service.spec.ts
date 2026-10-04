import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import API_BASE_URL from '@constants/api.config';
import BackupDownloadInterface from '@model/backups/backup-download.interface';
import DeleteBackupResponseInterface from '@model/backups/delete-backup-response.interface';
import GetBackupsResponseInterface from '@model/backups/get-backups-response.interface';
import BackupService from '@services/backup.service';
import { firstValueFrom } from 'rxjs';

describe('BackupService', () => {
  let service: BackupService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackupService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BackupService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  /**
   * Verifies that the complete backups list is requested.
   *
   * @returns Promise resolved when the request has been checked.
   */
  it('should get all backups', async (): Promise<void> => {
    const response: GetBackupsResponseInterface = {
      status: 'ok',
      list: [],
    };

    const resultPromise: Promise<GetBackupsResponseInterface> = firstValueFrom(service.getAll());

    const request = httpController.expectOne(`${API_BASE_URL}/admin/backups`);

    expect(request.request.method).toBe('GET');

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  /**
   * Verifies that a backup deletion uses its public identifier.
   *
   * @returns Promise resolved when the request has been checked.
   */
  it('should delete a backup', async (): Promise<void> => {
    const publicId: string = '9c9759fa-2a34-435b-96eb-7843f2e0d6de';

    const response: DeleteBackupResponseInterface = {
      status: 'ok',
      publicId,
      message: '',
    };

    const resultPromise: Promise<DeleteBackupResponseInterface> = firstValueFrom(
      service.delete({
        publicId,
      }),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/backups/delete`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      publicId,
    });

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  /**
   * Verifies that a backup download returns its blob and RFC 5987 filename.
   *
   * @returns Promise resolved when the request has been checked.
   */
  it('should download a backup using the original UTF-8 filename', async (): Promise<void> => {
    const publicId: string = '9c9759fa-2a34-435b-96eb-7843f2e0d6de';

    const blob: Blob = new Blob(['backup-data'], {
      type: 'application/octet-stream',
    });

    const resultPromise: Promise<BackupDownloadInterface> = firstValueFrom(
      service.download(publicId),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/backups/download/${publicId}`);

    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');

    request.flush(blob, {
      headers: {
        'Content-Disposition':
          'attachment; filename="backup.otpv"; filename*=UTF-8\'\'copia%20seguridad.otpv',
      },
    });

    const result: BackupDownloadInterface = await resultPromise;

    expect(result.blob).toBe(blob);
    expect(result.filename).toBe('copia seguridad.otpv');
  });

  /**
   * Verifies that the simple filename is used when filename* is unavailable.
   *
   * @returns Promise resolved when the request has been checked.
   */
  it('should use the simple download filename as fallback', async (): Promise<void> => {
    const publicId: string = '9c9759fa-2a34-435b-96eb-7843f2e0d6de';

    const blob: Blob = new Blob(['backup-data'], {
      type: 'application/octet-stream',
    });

    const resultPromise: Promise<BackupDownloadInterface> = firstValueFrom(
      service.download(publicId),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/backups/download/${publicId}`);

    request.flush(blob, {
      headers: {
        'Content-Disposition': 'attachment; filename="backup.otpv"',
      },
    });

    const result: BackupDownloadInterface = await resultPromise;

    expect(result.filename).toBe('backup.otpv');
  });

  /**
   * Verifies that a safe default filename is used when the header is unavailable.
   *
   * @returns Promise resolved when the request has been checked.
   */
  it('should use a default filename when Content-Disposition is unavailable', async (): Promise<void> => {
    const publicId: string = '9c9759fa-2a34-435b-96eb-7843f2e0d6de';

    const blob: Blob = new Blob(['backup-data'], {
      type: 'application/octet-stream',
    });

    const resultPromise: Promise<BackupDownloadInterface> = firstValueFrom(
      service.download(publicId),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/backups/download/${publicId}`);

    request.flush(blob);

    const result: BackupDownloadInterface = await resultPromise;

    expect(result.filename).toBe('backup.otpv');
  });
});
