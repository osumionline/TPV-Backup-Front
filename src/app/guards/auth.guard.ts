import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import AuthService from '@services/auth.service';
import { catchError, map, of } from 'rxjs';

const authGuard: CanActivateFn = (_route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  if (!authService.hasToken()) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        returnUrl: state.url,
      },
    });
  }

  if (authService.user() !== null) {
    return true;
  }

  return authService.me().pipe(
    map(() => true),
    catchError(() => {
      authService.clearSession();

      return of(
        router.createUrlTree(['/login'], {
          queryParams: {
            returnUrl: state.url,
          },
        }),
      );
    }),
  );
};

export default authGuard;
