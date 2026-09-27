import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import AuthService from '@services/auth.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-admin',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export default class Admin {
  private readonly authService: AuthService = inject(AuthService);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly router: Router = inject(Router);

  readonly user = this.authService.user;
  readonly mobileMenuOpen: WritableSignal<boolean> = signal(false);
  readonly isHandset: Signal<boolean> = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open: boolean) => !open);
  }

  closeMobileMenu(): void {
    if (this.isHandset()) {
      this.mobileMenuOpen.set(false);
    }
  }

  logout(): void {
    this.authService.clearSession();
    void this.router.navigateByUrl('/login');
  }
}
