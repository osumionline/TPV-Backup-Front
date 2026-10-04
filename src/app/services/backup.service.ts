import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import BackupDownloadInterface from '@model/backups/backup-download.interface';
import DeleteBackupRequestInterface from '@model/backups/delete-backup-request.interface';
import DeleteBackupResponseInterface from '@model/backups/delete-backup-response.interface';
import GetBackupsResponseInterface from '@model/backups/get-backups-response.interface';
import { map, Observable } from 'rxjs';

@Service()
export default class BackupService {
  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Gets all backups available to the administration panel.
   *
   * @returns Observable with the backups response.
   */
  getAll(): Observable<GetBackupsResponseInterface> {
    return this.http.get<GetBackupsResponseInterface>(`${API_BASE_URL}/admin/backups`);
  }

  /**
   * Downloads a stored backup.
   *
   * @param publicId Public identifier of the backup.
   *
   * @returns Observable containing the downloaded blob and its original filename.
   */
  download(publicId: string): Observable<BackupDownloadInterface> {
    return this.http
      .get(`${API_BASE_URL}/admin/backups/download/${encodeURIComponent(publicId)}`, {
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        map((response: HttpResponse<Blob>): BackupDownloadInterface => {
          if (response.body === null) {
            throw new Error('Backup download response does not contain a file.');
          }

          return {
            blob: response.body,
            filename: this.getDownloadFilename(response.headers.get('Content-Disposition')),
          };
        }),
      );
  }

  /**
   * Deletes a stored backup.
   *
   * @param data Backup identifier to delete.
   *
   * @returns Observable with the deletion response.
   */
  delete(data: DeleteBackupRequestInterface): Observable<DeleteBackupResponseInterface> {
    return this.http.post<DeleteBackupResponseInterface>(
      `${API_BASE_URL}/admin/backups/delete`,
      data,
    );
  }

  /**
   * Gets the filename declared by a download Content-Disposition header.
   *
   * RFC 5987 filename* is preferred over the simple filename fallback.
   *
   * @param contentDisposition Content-Disposition header value.
   *
   * @returns Download filename.
   */
  private getDownloadFilename(contentDisposition: string | null): string {
    if (contentDisposition === null) {
      return 'backup.otpv';
    }

    const encodedFilenameMatch: RegExpMatchArray | null = contentDisposition.match(
      /filename\*\s*=\s*UTF-8''([^;]+)/i,
    );

    if (encodedFilenameMatch !== null) {
      const encodedFilename: string = encodedFilenameMatch[1].trim().replace(/^"|"$/g, '');

      try {
        const filename: string = decodeURIComponent(encodedFilename);

        if (filename !== '') {
          return filename;
        }
      } catch {
        // Continue with the simple filename fallback.
      }
    }

    const filenameMatch: RegExpMatchArray | null =
      contentDisposition.match(/filename\s*=\s*"([^"]+)"/i);

    if (filenameMatch !== null && filenameMatch[1].trim() !== '') {
      return filenameMatch[1].trim();
    }

    return 'backup.otpv';
  }
}
