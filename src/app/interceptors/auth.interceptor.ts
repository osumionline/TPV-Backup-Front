import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import API_BASE_URL from '@constants/api.config';
import TokenStorageService from '@services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const tokenStorage: TokenStorageService = inject(TokenStorageService);
  const token: string | null = tokenStorage.token();

  if (
    token === null ||
    !req.url.startsWith(API_BASE_URL) ||
    req.url === `${API_BASE_URL}/admin/login`
  ) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
