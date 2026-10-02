import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import CreateInstallationRequestInterface from '@model/create-installation-request.interface';
import CreateInstallationResponseInterface from '@model/create-installation-response.interface';
import GetInstallationsResponseInterface from '@model/get-installations-response.interface';
import UpdateInstallationRequestInterface from '@model/update-installation-request.interface';
import UpdateInstallationResponseInterface from '@model/update-installation-response.interface';
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

  /**
   * Creates a new installation and its initial machine credential.
   *
   * @param data Installation data to create.
   *
   * @returns Observable with the creation response.
   */
  create(
    data: CreateInstallationRequestInterface,
  ): Observable<CreateInstallationResponseInterface> {
    return this.http.post<CreateInstallationResponseInterface>(
      `${API_BASE_URL}/admin/installations/create`,
      data,
    );
  }

  /**
   * Updates an existing installation.
   *
   * @param data Installation data to update.
   *
   * @returns Observable with the update response.
   */
  update(
    data: UpdateInstallationRequestInterface,
  ): Observable<UpdateInstallationResponseInterface> {
    return this.http.post<UpdateInstallationResponseInterface>(
      `${API_BASE_URL}/admin/installations/update`,
      data,
    );
  }
}
