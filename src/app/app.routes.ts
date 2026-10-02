import { Routes } from '@angular/router';
import authGuard from '@guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login').then((component) => component.default),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@pages/admin/admin').then((component) => component.default),
    children: [
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('@pages/subscriptions/subscriptions').then((component) => component.default),
      },
      {
        path: 'installations',
        loadComponent: () =>
          import('@pages/installations/installations').then((component) => component.default),
      },
      {
        path: 'dashboard',
        pathMatch: 'full',
        redirectTo: 'subscriptions',
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'subscriptions',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'subscriptions',
  },
];

export default routes;
