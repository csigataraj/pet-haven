import { TestBed } from '@angular/core/testing';

import { ProductCatalogService } from './product-catalog.service';

describe('ProductCatalogService', () => {
  let service: ProductCatalogService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [ProductCatalogService] });
    service = TestBed.inject(ProductCatalogService);
  });

  it('adds and fetches a new product', () => {
    const ok = service.addProduct({
      sku: ' custom-1 ',
      name: 'Custom Toy',
      imageUrl: 'https://example.com/x.jpg',
      category: 'Toys',
      price: 19.5,
      stock: 4.8
    });

    expect(ok).toBeTrue();
    const product = service.getBySku('CUSTOM-1');
    expect(product).not.toBeNull();
    expect(product?.stock).toBe(4);
  });

  it('prevents duplicate SKU and updates stock safely', () => {
    const first = service.addProduct({
      sku: 'DUP-1',
      name: 'One',
      imageUrl: 'https://example.com/one.jpg',
      category: 'Misc',
      price: 1,
      stock: 1
    });
    const second = service.addProduct({
      sku: 'dup-1',
      name: 'Two',
      imageUrl: 'https://example.com/two.jpg',
      category: 'Misc',
      price: 2,
      stock: 2
    });

    expect(first).toBeTrue();
    expect(second).toBeFalse();

    service.updateStock('DUP-1', -2);
    expect(service.getBySku('DUP-1')?.stock).toBe(0);
  });
});
