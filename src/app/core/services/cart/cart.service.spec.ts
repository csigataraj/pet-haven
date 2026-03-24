import { TestBed } from '@angular/core/testing';

import { CartService } from './cart.service';
import { ProductCatalogService } from '../product-catalog/product-catalog.service';

describe('CartService', () => {
  let service: CartService;
  let catalog: ProductCatalogService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [CartService, ProductCatalogService] });
    service = TestBed.inject(CartService);
    catalog = TestBed.inject(ProductCatalogService);
  });

  it('adds product and computes totals', () => {
    const product = catalog.getBySku('PET-001');
    expect(product).not.toBeNull();

    service.add(product!);
    service.add(product!);

    expect(service.quantityForSku('PET-001')).toBe(2);
    expect(service.totalCount()).toBe(2);
    expect(service.totalPrice()).toBe(product!.price * 2);
  });

  it('caps quantity at stock and clears cart', () => {
    const product = catalog.getBySku('PET-001');
    expect(product).not.toBeNull();

    service.add(product!);
    service.updateQuantity('PET-001', 999);
    expect(service.quantityForSku('PET-001')).toBe(product!.stock);

    service.clear();
    expect(service.cartItems()).toEqual([]);
  });
});
