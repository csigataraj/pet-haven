import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

import { AddressBookService, AuthService } from '../../../../core';
import { PageHeaderComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-account',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    TranslatePipe
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly addressBookService = inject(AddressBookService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly addressError = signal('');

  readonly addressForm = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.minLength(3)]],
    country: ['', [Validators.required, Validators.minLength(2)]]
  });

  readonly savedAddresses = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return [];
    }
    return this.addressBookService.getForEmail(user.email);
  });

  addAddress(): void {
    const user = this.currentUser();
    if (!user) {
      return;
    }
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const value = this.addressForm.getRawValue();
    this.addressBookService.addForEmail(user.email, {
      label: value.label,
      address: value.address,
      city: value.city,
      postalCode: value.postalCode,
      country: value.country
    });
    this.addressForm.reset({
      label: '',
      address: '',
      city: '',
      postalCode: '',
      country: ''
    });
    this.addressError.set('');
  }

  removeAddress(id: string): void {
    const user = this.currentUser();
    if (!user) {
      return;
    }
    this.addressBookService.removeForEmail(user.email, id);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
