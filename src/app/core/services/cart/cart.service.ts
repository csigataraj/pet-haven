import { Injectable, computed, inject, signal } from '@angular/core';

import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { Product } from '../../../features/shop/data';
import { ProductCatalogService } from '../product-catalog/product-catalog.service';

const STORAGE_KEY = 'pet1.cart';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly productCatalog = inject(ProductCatalogService);
  private readonly items = signal<CartItem[]>(this.load());

  readonly cartItems = this.items.asReadonly();

  readonly totalCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  add(product: Product): void {
    const liveProduct = this.productCatalog.getBySku(product.sku);
    if (!liveProduct || liveProduct.stock < 1) {
      return;
    }

    this.items.update((current) => {
      const existing = current.find((item) => item.product.sku === liveProduct.sku);
      if (existing) {
        if (existing.quantity >= liveProduct.stock) {
          return current;
        }
        return current.map((item) =>
          item.product.sku === liveProduct.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { product: liveProduct, quantity: 1 }];
    });
    this.persist();
  }

  remove(sku: string): void {
    this.items.update((current) => current.filter((item) => item.product.sku !== sku));
    this.persist();
  }

  updateQuantity(sku: string, quantity: number): void {
    if (quantity < 1) {
      this.remove(sku);
      return;
    }

    this.items.update((current) =>
      current.map((item) => {
        if (item.product.sku !== sku) {
          return item;
        }

        const liveProduct = this.productCatalog.getBySku(item.product.sku) ?? item.product;
        return {
          product: liveProduct,
          quantity: Math.min(quantity, liveProduct.stock)
        };
      })
    );
    this.persist();
  }

  quantityForSku(sku: string): number {
    const item = this.items().find((entry) => entry.product.sku === sku);
    return item?.quantity ?? 0;
  }

  clear(): void {
    this.items.set([]);
    this.persist();
  }

  private load(): CartItem[] {
    return loadFromStorage<CartItem[]>(STORAGE_KEY, []);
  }

  private persist(): void {
    saveToStorage(STORAGE_KEY, this.items());
  }
}
