import { Injectable, signal } from '@angular/core';

import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { PRODUCTS, Product } from '../../../features/shop/data';

const STORAGE_KEY = 'pet1.catalog';

export interface CreateProductInput {
  sku: string;
  name: string;
  imageUrl: string;
  category: string;
  price: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductCatalogService {
  private readonly productsState = signal<Product[]>(this.load());

  readonly products = this.productsState.asReadonly();

  getBySku(sku: string): Product | null {
    return this.productsState().find((product) => product.sku === sku) ?? null;
  }

  updateStock(sku: string, stock: number): void {
    const normalized = Math.max(0, Math.floor(stock));
    this.productsState.update((current) =>
      current.map((product) =>
        product.sku === sku ? { ...product, stock: normalized } : product
      )
    );
    this.persist();
  }

  updateProduct(sku: string, patch: Partial<Omit<Product, 'sku'>>): void {
    this.productsState.update((current) =>
      current.map((product) =>
        product.sku === sku
          ? {
              ...product,
              ...patch,
              price: patch.price === undefined ? product.price : Math.max(0, patch.price),
              stock: patch.stock === undefined ? product.stock : Math.max(0, Math.floor(patch.stock))
            }
          : product
      )
    );
    this.persist();
  }

  addProduct(input: CreateProductInput): boolean {
    const normalizedSku = input.sku.trim().toUpperCase();
    if (!normalizedSku || this.getBySku(normalizedSku)) {
      return false;
    }

    const product: Product = {
      sku: normalizedSku,
      name: input.name.trim(),
      imageUrl: input.imageUrl.trim(),
      category: input.category.trim(),
      price: Math.max(0, input.price),
      stock: Math.max(0, Math.floor(input.stock)),
      description: `${input.name.trim()} from ${input.category.trim()} collection.`,
      highlights: ['Catalog managed item', 'Available online', 'Backoffice controlled']
    };

    this.productsState.update((current) => [product, ...current]);
    this.persist();
    return true;
  }

  removeProduct(sku: string): void {
    this.productsState.update((current) =>
      current.filter((product) => product.sku !== sku)
    );
    this.persist();
  }

  private load(): Product[] {
    return loadFromStorage<Product[]>(STORAGE_KEY, PRODUCTS);
  }

  private persist(): void {
    saveToStorage(STORAGE_KEY, this.productsState());
  }
}
