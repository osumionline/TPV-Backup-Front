import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import GetAuditLogsResponseInterface from '@model/audit/get-audit-logs-response.interface';
import { Observable } from 'rxjs';

@Service()
export default class AuditLogService {
  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Gets one page of audit events.
   *
   * @param page One-based page number.
   * @param pageSize Number of events per page.
   *
   * @returns Observable with the paginated audit response.
   */
  getPage(page: number, pageSize: number): Observable<GetAuditLogsResponseInterface> {
    const params: HttpParams = new HttpParams().set('page', page).set('pageSize', pageSize);

    return this.http.get<GetAuditLogsResponseInterface>(`${API_BASE_URL}/admin/audit`, {
      params,
    });
  }
}
