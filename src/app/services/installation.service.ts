import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import CreateInstallationRequestInterface from '@model/installations/create-installation-request.interface';
import CreateInstallationResponseInterface from '@model/installations/create-installation-response.interface';
import InstallationCredentialRequestInterface from '@model/installations/credentials/installation-credential-request.interface';
import RevokeInstallationCredentialResponseInterface from '@model/installations/credentials/revoke-installation-credential-response.interface';
import RotateInstallationCredentialResponseInterface from '@model/installations/credentials/rotate-installation-credential-response.interface';
import DeleteInstallationRequestInterface from '@model/installations/delete-installation-request.interface';
import DeleteInstallationResponseInterface from '@model/installations/delete-installation-response.interface';
import GetInstallationsResponseInterface from '@model/installations/get-installations-response.interface';
import SetInstallationActiveRequestInterface from '@model/installations/set-installation-active-request.interface';
import SetInstallationActiveResponseInterface from '@model/installations/set-installation-active-response.interface';
import UpdateInstallationRequestInterface from '@model/installations/update-installation-request.interface';
import UpdateInstallationResponseInterface from '@model/installations/update-installation-response.interface';
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

  /**
   * Changes the administrative active state of an installation.
   *
   * @param data Installation identifier and desired active state.
   *
   * @returns Observable with the state change response.
   */
  setActive(
    data: SetInstallationActiveRequestInterface,
  ): Observable<SetInstallationActiveResponseInterface> {
    return this.http.post<SetInstallationActiveResponseInterface>(
      `${API_BASE_URL}/admin/installations/set-active`,
      data,
    );
  }

  /**
   * Deletes an installation without registered backups.
   *
   * @param data Installation identifier to delete.
   *
   * @returns Observable with the deletion response.
   */
  delete(
    data: DeleteInstallationRequestInterface,
  ): Observable<DeleteInstallationResponseInterface> {
    return this.http.post<DeleteInstallationResponseInterface>(
      `${API_BASE_URL}/admin/installations/delete`,
      data,
    );
  }

  /**
   * Revokes the active credential of an installation.
   *
   * @param data Installation identifier.
   *
   * @returns Observable with the revocation response.
   */
  revokeCredential(
    data: InstallationCredentialRequestInterface,
  ): Observable<RevokeInstallationCredentialResponseInterface> {
    return this.http.post<RevokeInstallationCredentialResponseInterface>(
      `${API_BASE_URL}/admin/installations/revoke-credential`,
      data,
    );
  }

  /**
   * Rotates or generates the active credential of an installation.
   *
   * @param data Installation identifier.
   *
   * @returns Observable with the newly generated credential.
   */
  rotateCredential(
    data: InstallationCredentialRequestInterface,
  ): Observable<RotateInstallationCredentialResponseInterface> {
    return this.http.post<RotateInstallationCredentialResponseInterface>(
      `${API_BASE_URL}/admin/installations/rotate-credential`,
      data,
    );
  }
}
