import { Routes } from '@angular/router';
import authGuard from '@guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login').then((component) => component.default),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@pages/dashboard/dashboard').then((component) => component.default),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

export default routes;
