import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import GetInstallationsResponseInterface from '@model/get-installations-response.interface';
import { Observable } from 'rxjs';

@Service()
export default class InstallationService {
  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Gets all installations available to the administration panel.
   *
   * @returns Observable with the installations response.
   */
  getAll(): Observable<GetInstallationsResponseInterface> {
    return this.http.get<GetInstallationsResponseInterface>(`${API_BASE_URL}/admin/installations`);
  }
}
