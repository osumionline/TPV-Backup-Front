import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import LoginFormInterface from '@model/login-form.interface';
import AuthService from '@services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export default class Login {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);

  readonly loading: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<string | null> = signal(null);

  readonly form: FormGroup<LoginFormInterface> = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService
      .login(email, password)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(this.getReturnUrl());
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.error.set('El email o la contraseña no son correctos.');
            return;
          }

          this.error.set('No se ha podido conectar con TPV Backup. Inténtalo de nuevo.');
        },
      });
  }

  private getReturnUrl(): string {
    const returnUrl: string | null = this.route.snapshot.queryParamMap.get('returnUrl');

    if (
      returnUrl === null ||
      !returnUrl.startsWith('/') ||
      returnUrl.startsWith('//') ||
      returnUrl === '/login'
    ) {
      return '/dashboard';
    }

    return returnUrl;
  }
}
