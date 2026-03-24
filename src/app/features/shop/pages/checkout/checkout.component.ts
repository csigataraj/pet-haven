import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';

import { AddressBookService, AuthService, CartService, NotificationService, OrderService, PaymentResult, PaymentService, PlacedOrder, TranslateService } from '../../../../core';
import { PageHeaderComponent, PriceComponent, TranslatePipe } from '../../../../shared/components';

type ShippingMethod = 'standard' | 'express' | 'pickup';
type CouponCode = 'SAVE10' | 'FREESHIP';

interface Coupon {
  code: CouponCode;
  descriptionKey: string;
}

interface CountryPricing {
  code: string;
  labelKey: string;
  currencyCode: string;
  taxRate: number;
}

const COUPONS: Coupon[] = [
  { code: 'SAVE10', descriptionKey: 'shop.checkout.couponSave10' },
  { code: 'FREESHIP', descriptionKey: 'shop.checkout.couponFreeShip' }
];

const COUNTRY_PRICING: CountryPricing[] = [
  { code: 'US', labelKey: 'shop.checkout.countryUS', currencyCode: 'USD', taxRate: 0.07 },
  { code: 'DE', labelKey: 'shop.checkout.countryDE', currencyCode: 'EUR', taxRate: 0.19 },
  { code: 'GB', labelKey: 'shop.checkout.countryGB', currencyCode: 'GBP', taxRate: 0.2 }
];

@Component({
  selector: 'app-checkout',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
    PriceComponent,
    TranslatePipe
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);
  readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly notificationService = inject(NotificationService);
  private readonly addressBookService = inject(AddressBookService);
  private readonly paymentService = inject(PaymentService);

  readonly currentUser = this.authService.currentUser;
  readonly placedOrder = signal<PlacedOrder | null>(null);
  readonly couponInput = signal('');
  readonly couponError = signal('');
  readonly appliedCoupon = signal<Coupon | null>(null);
  readonly guestPassword = signal('');
  readonly guestPasswordConfirm = signal('');
  readonly guestSignupError = signal('');
  readonly guestSignupSuccess = signal('');
  readonly paymentError = signal('');
  readonly saveAddressInProfile = signal(false);

  readonly checkoutForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.minLength(3)]],
    country: this.fb.nonNullable.control('US', [Validators.required]),
    shippingMethod: this.fb.nonNullable.control<ShippingMethod>('standard'),
    paymentMethod: this.fb.nonNullable.control<'card' | 'cash-on-delivery'>('card'),
    cardHolder: ['', [Validators.minLength(2)]],
    cardNumber: ['', [Validators.minLength(13)]],
    cardExpiry: [''],
    cardCvv: ['', [Validators.minLength(3), Validators.maxLength(4)]]
  });

  readonly countryOptions = COUNTRY_PRICING;

  readonly savedAddresses = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return [];
    }
    return this.addressBookService.getForEmail(user.email);
  });

  readonly requiresCardDetails = computed(
    () => this.checkoutForm.controls.paymentMethod.value === 'card'
  );

  readonly selectedCountry = computed(
    () => COUNTRY_PRICING.find((entry) => entry.code === this.checkoutForm.controls.country.value) ?? COUNTRY_PRICING[0]
  );

  readonly currencyCode = computed(() => this.selectedCountry().currencyCode);

  readonly shippingCost = computed(() => {
    const method = this.checkoutForm.controls.shippingMethod.value;
    const coupon = this.appliedCoupon();

    if (coupon?.code === 'FREESHIP' && method === 'standard') {
      return 0;
    }

    if (method === 'express') {
      return 9.99;
    }
    if (method === 'pickup') {
      return 0;
    }
    return 4.99;
  });

  readonly discountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) {
      return 0;
    }
    if (coupon.code === 'SAVE10') {
      return this.cartService.totalPrice() * 0.1;
    }
    return 0;
  });

  readonly taxAmount = computed(
    () => (this.cartService.totalPrice() - this.discountAmount()) * this.selectedCountry().taxRate
  );

  readonly grandTotal = computed(
    () => this.cartService.totalPrice() - this.discountAmount() + this.shippingCost() + this.taxAmount()
  );

  readonly availableCoupons = COUPONS;

  constructor() {
    const user = this.currentUser();
    if (user) {
      this.checkoutForm.patchValue({
        fullName: user.name,
        email: user.email,
        country: 'US'
      });

      const saved = this.addressBookService.getForEmail(user.email)[0];
      if (saved) {
        this.checkoutForm.patchValue({
          address: saved.address,
          city: saved.city,
          postalCode: saved.postalCode,
          country: saved.country.toUpperCase()
        });
      }
    }
  }

  submitOrder(): void {
    if (this.cartService.cartItems().length === 0) {
      return;
    }
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.paymentError.set('');
    if (this.requiresCardDetails() && !this.validateCardFields()) {
      return;
    }

    const value = this.checkoutForm.getRawValue();

    const paymentResult: PaymentResult = this.requiresCardDetails()
      ? this.paymentService.authorizeCard({
          customerEmail: value.email,
          cardHolder: value.cardHolder,
          cardNumber: value.cardNumber,
          expiry: value.cardExpiry,
          cvv: value.cardCvv,
          amount: this.grandTotal(),
          currencyCode: this.currencyCode()
        })
      : { ok: true };

    if (!paymentResult.ok) {
      this.paymentError.set(paymentResult.message ?? 'Payment authorization failed.');
      return;
    }

    const order = this.orderService.placeOrder({
      customerName: value.fullName,
      customerEmail: value.email,
      shippingAddress: value.address,
      city: value.city,
      postalCode: value.postalCode,
      country: value.country,
      shippingMethod: value.shippingMethod,
      paymentMethod: value.paymentMethod,
      couponCode: this.appliedCoupon()?.code ?? null,
      items: this.cartService.cartItems().map((item) => ({
        sku: item.product.sku,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price
      })),
      subtotal: this.cartService.totalPrice(),
      discount: this.discountAmount(),
      shippingCost: this.shippingCost(),
      tax: this.taxAmount(),
      currencyCode: this.currencyCode(),
      paymentAuthCode: paymentResult.authCode ?? null,
      paymentCardLast4: paymentResult.last4 ?? null,
      paymentCardFingerprint: paymentResult.cardFingerprint ?? null
    });

    this.placedOrder.set(order);
    this.notificationService.pushOrderConfirmation(order.customerEmail, order.id);

    if (this.currentUser() && this.saveAddressInProfile()) {
      this.persistCheckoutAddressIfNeeded();
    }

    this.cartService.clear();
    this.appliedCoupon.set(null);
    this.couponInput.set('');
    this.couponError.set('');
    this.guestSignupSuccess.set('');
    this.guestSignupError.set('');
  }

  applyCoupon(): void {
    const code = this.couponInput().trim().toUpperCase();
    if (!code) {
      this.appliedCoupon.set(null);
      this.couponError.set('');
      return;
    }

    const coupon = COUPONS.find((entry) => entry.code === code);
    if (!coupon) {
      this.appliedCoupon.set(null);
      this.couponError.set('Unknown code. Try SAVE10 or FREESHIP.');
      return;
    }

    this.appliedCoupon.set(coupon);
    this.couponError.set('');
  }

  setCouponInput(value: string): void {
    this.couponInput.set(value);
  }

  toggleSaveAddress(enabled: boolean): void {
    this.saveAddressInProfile.set(enabled);
  }

  useSavedAddress(id: string): void {
    const selected = this.savedAddresses().find((entry) => entry.id === id);
    if (!selected) {
      return;
    }

    this.checkoutForm.patchValue({
      address: selected.address,
      city: selected.city,
      postalCode: selected.postalCode,
      country: selected.country.toUpperCase()
    });
  }

  setGuestPassword(value: string): void {
    this.guestPassword.set(value);
  }

  setGuestPasswordConfirm(value: string): void {
    this.guestPasswordConfirm.set(value);
  }

  createGuestAccountFromOrder(): void {
    const order = this.placedOrder();
    if (!order || this.currentUser()) {
      return;
    }

    const password = this.guestPassword();
    const confirm = this.guestPasswordConfirm();

    if (password.length < 6) {
      this.guestSignupError.set('Password must be at least 6 characters.');
      this.guestSignupSuccess.set('');
      return;
    }
    if (password !== confirm) {
      this.guestSignupError.set('Passwords do not match.');
      this.guestSignupSuccess.set('');
      return;
    }

    const error = this.authService.register(order.customerName, order.customerEmail, password);
    if (error) {
      this.guestSignupError.set(error);
      this.guestSignupSuccess.set('');
      return;
    }

    this.guestSignupError.set('');
    this.guestSignupSuccess.set('Account created. You are now signed in.');
    this.guestPassword.set('');
    this.guestPasswordConfirm.set('');
  }

  goToOrders(): void {
    this.router.navigateByUrl('/orders');
  }

  private validateCardFields(): boolean {
    const value = this.checkoutForm.getRawValue();
    const normalizedCard = value.cardNumber.replace(/\s+/g, '');
    const expiry = value.cardExpiry.trim();
    const cvv = value.cardCvv.trim();
    const holder = value.cardHolder.trim();

    if (holder.length < 2) {
      this.paymentError.set('Card holder name is required.');
      return false;
    }
    if (!/^\d{13,19}$/.test(normalizedCard)) {
      this.paymentError.set('Card number must contain 13 to 19 digits.');
      return false;
    }
    if (!this.isValidExpiry(expiry)) {
      this.paymentError.set('Expiry must be in MM/YY format and not expired.');
      return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      this.paymentError.set('CVV must contain 3 or 4 digits.');
      return false;
    }

    return true;
  }

  private isValidExpiry(value: string): boolean {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      return false;
    }

    const month = Number(match[1]);
    const year = Number(match[2]);
    if (month < 1 || month > 12) {
      return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) {
      return false;
    }
    if (year === currentYear && month < currentMonth) {
      return false;
    }

    return true;
  }

  private persistCheckoutAddressIfNeeded(): void {
    const user = this.currentUser();
    if (!user) {
      return;
    }

    const value = this.checkoutForm.getRawValue();
    const address = {
      address: value.address,
      city: value.city,
      postalCode: value.postalCode,
      country: value.country
    };

    if (this.addressBookService.hasMatchingAddress(user.email, address)) {
      return;
    }

    this.addressBookService.addForEmail(user.email, {
      label: 'Checkout address',
      ...address
    });
  }

  getCouponDescription(key: string): string {
    return this.translate.t(key);
  }

  getCountryLabel(key: string): string {
    return this.translate.t(key);
  }
}
