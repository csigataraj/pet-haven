import { TestBed } from '@angular/core/testing';

import { WishlistService } from './wishlist.service';

describe('WishlistService', () => {
  let service: WishlistService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WishlistService] });
    service = TestBed.inject(WishlistService);
  });

  it('adds, toggles, and removes SKUs', () => {
    service.add('PET-001');
    expect(service.isInWishlist('PET-001')).toBeTrue();

    service.toggle('PET-001');
    expect(service.isInWishlist('PET-001')).toBeFalse();

    service.toggle('PET-002');
    expect(service.skus()).toEqual(['PET-002']);
  });

  it('persists to localStorage', () => {
    service.add('PET-003');

    const raw = localStorage.getItem('pet1.wishlist');
    expect(raw).toContain('PET-003');
  });
});
