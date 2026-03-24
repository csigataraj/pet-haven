import { Injectable, signal } from '@angular/core';

import { loadFromStorage, saveToStorage } from '../../utils/storage';

const STORAGE_KEY = 'pet1.wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly skuState = signal<string[]>(this.load());

  readonly skus = this.skuState.asReadonly();

  isInWishlist(sku: string): boolean {
    return this.skuState().includes(sku);
  }

  toggle(sku: string): void {
    if (this.isInWishlist(sku)) {
      this.remove(sku);
      return;
    }
    this.add(sku);
  }

  add(sku: string): void {
    if (this.isInWishlist(sku)) {
      return;
    }
    this.skuState.update((current) => [...current, sku]);
    this.persist();
  }

  remove(sku: string): void {
    this.skuState.update((current) => current.filter((item) => item !== sku));
    this.persist();
  }

  clear(): void {
    this.skuState.set([]);
    this.persist();
  }

  private load(): string[] {
    const parsed = loadFromStorage<unknown[]>(STORAGE_KEY, []);
    return parsed.filter((item): item is string => typeof item === 'string');
  }

  private persist(): void {
    saveToStorage(STORAGE_KEY, this.skuState());
  }
}
