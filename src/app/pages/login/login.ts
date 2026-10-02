import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { email, FieldTree, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import LoginFormInterface from '@model/auth/login-form.interface';
import AuthService from '@services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    FormField,
    FormRoot,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatPrefix,
    MatProgressSpinner,
    MatSuffix,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export default class Login {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly formModel: WritableSignal<LoginFormInterface> = signal({
    email: '',
    password: '',
  });

  readonly hidePassword: WritableSignal<boolean> = signal(true);

  readonly passwordType: Signal<'password' | 'text'> = computed(() =>
    this.hidePassword() ? 'password' : 'text',
  );

  readonly passwordIcon: Signal<string> = computed(() =>
    this.hidePassword() ? 'visibility' : 'visibility_off',
  );

  readonly passwordToggleLabel: Signal<string> = computed(() =>
    this.hidePassword() ? 'Mostrar contraseña' : 'Ocultar contraseña',
  );

  readonly loginForm: FieldTree<LoginFormInterface> = form(
    this.formModel,
    (path) => {
      required(path.email, {
        message: 'Introduce el email.',
      });

      email(path.email, {
        message: 'Introduce un email válido.',
      });

      required(path.password, {
        message: 'Introduce la contraseña.',
      });
    },
    {
      submission: {
        action: async (field) => {
          const data: LoginFormInterface = field().value();

          try {
            await firstValueFrom(this.authService.login(data.email.trim(), data.password));
            await this.router.navigateByUrl(this.getReturnUrl());

            return undefined;
          } catch (error: unknown) {
            if (error instanceof HttpErrorResponse && error.status === 401) {
              return {
                kind: 'credentials',
                message: 'El email o la contraseña no son correctos.',
              };
            }

            return {
              kind: 'server',
              message: 'No se ha podido conectar con TPV Backup. Inténtalo de nuevo.',
            };
          }
        },
      },
    },
  );

  /**
   * Toggles the visibility of the password field.
   *
   * @returns void
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update((hidden: boolean) => !hidden);
  }

  /**
   * Gets a safe URL to navigate to after a successful login.
   *
   * @returns Valid internal return URL.
   */
  private getReturnUrl(): string {
    const returnUrl: string | null = this.route.snapshot.queryParamMap.get('returnUrl');

    if (
      returnUrl === null ||
      !returnUrl.startsWith('/') ||
      returnUrl.startsWith('//') ||
      returnUrl === '/login'
    ) {
      return '/subscriptions';
    }

    return returnUrl;
  }
}
