import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import API_BASE_URL from '@constants/api.config';
import AdminUserInterface from '@model/auth/admin-user.interface';
import LoginResponseInterface from '@model/auth/login-response.interface';
import MeResponseInterface from '@model/auth/me-response.interface';
import AuthService from '@services/auth.service';
import TokenStorageService from '@services/token-storage.service';
import { firstValueFrom } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let tokenStorage: TokenStorageService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        TokenStorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    tokenStorage = TestBed.inject(TokenStorageService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    sessionStorage.clear();
  });

  it('should authenticate and store the administrator session', async (): Promise<void> => {
    const user: AdminUserInterface = {
      publicId: 'admin-public-id',
      name: 'Administrador',
      email: 'admin@example.com',
    };

    const response: LoginResponseInterface = {
      status: 'ok',
      token: 'test-token',
      expiresAt: 1234567890,
      user,
    };

    const resultPromise: Promise<LoginResponseInterface> = firstValueFrom(
      service.login('admin@example.com', 'secret'),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'admin@example.com',
      password: 'secret',
    });

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);

    expect(tokenStorage.token()).toBe('test-token');
    expect(service.user()).toEqual(user);
    expect(service.hasToken()).toBe(true);
  });

  it('should reject an unsuccessful login response', async (): Promise<void> => {
    const user: AdminUserInterface = {
      publicId: '',
      name: '',
      email: '',
    };

    const resultPromise: Promise<LoginResponseInterface> = firstValueFrom(
      service.login('admin@example.com', 'wrong-password'),
    );

    const request = httpController.expectOne(`${API_BASE_URL}/admin/login`);

    request.flush({
      status: 'error',
      token: '',
      expiresAt: 0,
      user,
    });

    await expect(resultPromise).rejects.toMatchObject({
      status: 401,
    });

    expect(tokenStorage.token()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.hasToken()).toBe(false);
  });

  it('should load the authenticated administrator', async (): Promise<void> => {
    const user: AdminUserInterface = {
      publicId: 'admin-public-id',
      name: 'Administrador',
      email: 'admin@example.com',
    };

    const response: MeResponseInterface = {
      status: 'ok',
      user,
    };

    const resultPromise: Promise<MeResponseInterface> = firstValueFrom(service.me());

    const request = httpController.expectOne(`${API_BASE_URL}/admin/me`);

    expect(request.request.method).toBe('GET');

    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);

    expect(service.user()).toEqual(user);
  });

  it('should clear the current session', async (): Promise<void> => {
    const user: AdminUserInterface = {
      publicId: 'admin-public-id',
      name: 'Administrador',
      email: 'admin@example.com',
    };

    tokenStorage.setToken('test-token');

    const resultPromise: Promise<MeResponseInterface> = firstValueFrom(service.me());

    const request = httpController.expectOne(`${API_BASE_URL}/admin/me`);

    request.flush({
      status: 'ok',
      user,
    });

    await resultPromise;

    expect(service.user()).toEqual(user);
    expect(service.hasToken()).toBe(true);

    service.clearSession();

    expect(tokenStorage.token()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.hasToken()).toBe(false);
  });
});
