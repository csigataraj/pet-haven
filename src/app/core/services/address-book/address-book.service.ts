import { Injectable } from '@angular/core';

import { createPrefixedId } from '../../utils/id';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

type AddressStore = Record<string, SavedAddress[]>;

const STORAGE_KEY = 'pet1.addressBook';

@Injectable({ providedIn: 'root' })
export class AddressBookService {
  getForEmail(email: string): SavedAddress[] {
    const normalized = email.trim().toLowerCase();
    const store = this.readStore();
    return store[normalized] ?? [];
  }

  addForEmail(email: string, input: Omit<SavedAddress, 'id'>): SavedAddress {
    const normalized = email.trim().toLowerCase();
    const store = this.readStore();

    const next: SavedAddress = {
      id: createPrefixedId('AD', 5),
      label: input.label.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country.trim()
    };

    store[normalized] = [next, ...(store[normalized] ?? [])];
    this.writeStore(store);
    return next;
  }

  removeForEmail(email: string, id: string): void {
    const normalized = email.trim().toLowerCase();
    const store = this.readStore();
    store[normalized] = (store[normalized] ?? []).filter((entry) => entry.id !== id);
    this.writeStore(store);
  }

  hasMatchingAddress(email: string, address: Omit<SavedAddress, 'id' | 'label'>): boolean {
    const normalized = email.trim().toLowerCase();
    const store = this.readStore();
    return (store[normalized] ?? []).some((entry) =>
      entry.address.toLowerCase() === address.address.trim().toLowerCase() &&
      entry.city.toLowerCase() === address.city.trim().toLowerCase() &&
      entry.postalCode.toLowerCase() === address.postalCode.trim().toLowerCase() &&
      entry.country.toLowerCase() === address.country.trim().toLowerCase()
    );
  }

  private readStore(): AddressStore {
    const parsed = loadFromStorage<Record<string, SavedAddress[]> | null>(STORAGE_KEY, {});
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  }

  private writeStore(store: AddressStore): void {
    saveToStorage(STORAGE_KEY, store);
  }
}
