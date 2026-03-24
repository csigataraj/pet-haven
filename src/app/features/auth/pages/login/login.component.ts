import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AuthService, ensureFormValid, withLoading } from '../../../../core';
import { TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly loginError = signal('');
  readonly loading = signal(false);
  readonly showPassword = signal(false);

  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  submit(): void {
    if (!ensureFormValid(this.form)) {
      return;
    }

    this.loginError.set('');

    const { email, password } = this.form.getRawValue();

    const ok = withLoading(this.loading, () => this.auth.login(email, password));

    if (ok) {
      this.router.navigate(['/']);
    } else {
      this.loginError.set(this.auth.loginErrorMessage(email));
    }
  }
}
