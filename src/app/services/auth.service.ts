import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Service, Signal, signal } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import AdminUserInterface from '@model/admin-user.interface';
import LoginResponseInterface from '@model/login-response.interface';
import MeResponseInterface from '@model/me-response.interface';
import TokenStorageService from '@services/token-storage.service';
import { Observable, tap } from 'rxjs';

@Service()
export default class AuthService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly tokenStorage: TokenStorageService = inject(TokenStorageService);

  private readonly userState = signal<AdminUserInterface | null>(null);

  readonly user: Signal<AdminUserInterface | null> = this.userState.asReadonly();
  readonly hasToken: Signal<boolean> = computed(() => {
    const token: string | null = this.tokenStorage.token();

    return token !== null && token.trim() !== '';
  });

  login(email: string, password: string): Observable<LoginResponseInterface> {
    return this.http
      .post<LoginResponseInterface>(`${API_BASE_URL}/admin/login`, {
        email,
        password,
      })
      .pipe(
        tap((response: LoginResponseInterface) => {
          if (response.status !== 'ok' || response.token.trim() === '') {
            throw new HttpErrorResponse({
              status: 401,
              statusText: 'Unauthorized',
              error: response,
            });
          }

          this.tokenStorage.setToken(response.token);
          this.userState.set(response.user);
        }),
      );
  }

  me(): Observable<MeResponseInterface> {
    return this.http.get<MeResponseInterface>(`${API_BASE_URL}/admin/me`).pipe(
      tap((response: MeResponseInterface) => {
        this.userState.set(response.user);
      }),
    );
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this.userState.set(null);
  }
}
