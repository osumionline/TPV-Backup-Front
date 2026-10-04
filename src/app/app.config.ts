import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import routes from '@app/app.routes';
import authInterceptor from '@interceptors/auth.interceptor';
import DatepickerIntlService from '@services/datepicker-intl.service';
import PaginatorIntlService from '@services/paginator-intl.service';

const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'es-ES',
    },
    provideNativeDateAdapter(),
    {
      provide: MatDatepickerIntl,
      useClass: DatepickerIntlService,
    },
    {
      provide: MatPaginatorIntl,
      useClass: PaginatorIntlService,
    },
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
  ],
};

export default appConfig;
