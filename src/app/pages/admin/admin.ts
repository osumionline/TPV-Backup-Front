import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import AuthService from '@services/auth.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-admin',
  imports: [
    MatIcon,
    MatIconButton,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatNavList,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatToolbar,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatTooltip,
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
