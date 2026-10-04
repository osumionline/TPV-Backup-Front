import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import API_BASE_URL from '@constants/api.config';
import CreateInstallationResponseInterface from '@model/installations/create-installation-response.interface';
import RevokeInstallationCredentialResponseInterface from '@model/installations/credentials/revoke-installation-credential-response.interface';
import RotateInstallationCredentialResponseInterface from '@model/installations/credentials/rotate-installation-credential-response.interface';
import DeleteInstallationResponseInterface from '@model/installations/delete-installation-response.interface';
import GetInstallationsResponseInterface from '@model/installations/get-installations-response.interface';
import SetInstallationActiveResponseInterface from '@model/installations/set-installation-active-response.interface';
import UpdateInstallationResponseInterface from '@model/installations/update-installation-response.interface';
import InstallationService from '@services/installation.service';
import { firstValueFrom } from 'rxjs';

describe('InstallationService', () => {
  let service: InstallationService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InstallationService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(InstallationService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should get all installations', async (): Promise<void> => {
    const resultPromise: Promise<GetInstallationsResponseInterface> = firstValueFrom(
      service.getAll(),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/installations`);

    expect(request.request.method).toBe('GET');

    const response = {
      status: 'ok',
      list: [],
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should create an installation', async (): Promise<void> => {
    const data = {
      subscriptionPublicId: 'subscription-public-id',
      name: 'TPV principal',
    };

    const resultPromise: Promise<CreateInstallationResponseInterface> = firstValueFrom(
      service.create(data),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/installations/create`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'installation-public-id',
      keyId: 'credential-key-id',
      secret: 'credential-secret',
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should update an installation', async (): Promise<void> => {
    const data = {
      publicId: 'installation-public-id',
      name: 'TPV actualizado',
    };

    const resultPromise: Promise<UpdateInstallationResponseInterface> = firstValueFrom(
      service.update(data),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/installations/update`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'installation-public-id',
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should change an installation active state', async (): Promise<void> => {
    const data = {
      publicId: 'installation-public-id',
      active: false,
    };

    const resultPromise: Promise<SetInstallationActiveResponseInterface> = firstValueFrom(
      service.setActive(data),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/installations/set-active`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'installation-public-id',
      active: false,
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should delete an installation', async (): Promise<void> => {
    const data = {
      publicId: 'installation-public-id',
    };

    const resultPromise: Promise<DeleteInstallationResponseInterface> = firstValueFrom(
      service.delete(data),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/installations/delete`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'installation-public-id',
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should revoke an installation credential', async (): Promise<void> => {
    const data = {
      publicId: 'installation-public-id',
    };

    const resultPromise: Promise<RevokeInstallationCredentialResponseInterface> = firstValueFrom(
      service.revokeCredential(data),
    );

    const request = httpController.expectOne(
      `${API_BASE_URL}/admin/installations/revoke-credential`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'installation-public-id',
      revokedCount: 1,
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should rotate an installation credential', async (): Promise<void> => {
    const data = {
      publicId: 'installation-public-id',
    };

    const resultPromise: Promise<RotateInstallationCredentialResponseInterface> = firstValueFrom(
      service.rotateCredential(data),
    );

    const request = httpController.expectOne(
      `${API_BASE_URL}/admin/installations/rotate-credential`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);

    const response = {
      status: 'ok',
      publicId: 'installation-public-id',
      keyId: 'new-key-id',
      secret: 'new-secret',
      message: '',
    };

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });
});
