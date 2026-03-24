import { Injectable, inject } from '@angular/core';

import { Product } from '../../../features/shop/data';
import { CartService } from '../cart/cart.service';
import { ProductCatalogService } from '../product-catalog/product-catalog.service';
import { WishlistService } from '../wishlist/wishlist.service';

@Injectable({ providedIn: 'root' })
export class ShopActionsService {
  private readonly cartService = inject(CartService);
  private readonly productCatalog = inject(ProductCatalogService);
  private readonly wishlistService = inject(WishlistService);

  addToCartBySku(sku: string): void {
    this.addToCart(this.productCatalog.getBySku(sku));
  }

  addToCart(product: Product | null): void {
    if (!product) {
      return;
    }

    this.cartService.add(product);
  }

  canAddToCart(sku: string, stock: number): boolean {
    return stock > this.cartService.quantityForSku(sku);
  }

  canAddProductToCart(product: Product | null): boolean {
    if (!product) {
      return false;
    }

    return this.canAddToCart(product.sku, product.stock);
  }

  toggleWishlistBySku(sku: string): void {
    this.wishlistService.toggle(sku);
  }

  toggleWishlist(product: Product | null): void {
    if (!product) {
      return;
    }

    this.toggleWishlistBySku(product.sku);
  }

  isInWishlist(sku: string): boolean {
    return this.wishlistService.isInWishlist(sku);
  }
}
