import { AbstractControl } from '@angular/forms';
import { WritableSignal } from '@angular/core';

export function ensureFormValid(form: AbstractControl): boolean {
  if (form.invalid) {
    form.markAllAsTouched();
    return false;
  }
  return true;
}

export function withLoading<T>(loading: WritableSignal<boolean>, action: () => T): T {
  loading.set(true);
  try {
    return action();
  } finally {
    loading.set(false);
  }
}
