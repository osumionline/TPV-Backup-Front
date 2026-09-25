import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import AuthService from '@services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export default class Dashboard {
  private readonly router: Router = inject(Router);
  readonly authService: AuthService = inject(AuthService);

  logout(): void {
    this.authService.clearSession();
    void this.router.navigateByUrl('/login');
  }
}
