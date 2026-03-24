import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { CartService, ProductCatalogService, WishlistService } from '../../../../core';
import { PageHeaderComponent, PriceComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink, PageHeaderComponent, PriceComponent, TranslatePipe, MatButtonModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly productCatalog = inject(ProductCatalogService);

  readonly products = this.productCatalog.products;

  readonly wishlistItems = computed(() => {
    const skus = this.wishlistService.skus();
    return this.products().filter((product) => skus.includes(product.sku));
  });

  remove(sku: string): void {
    this.wishlistService.remove(sku);
  }

  moveToCart(sku: string): void {
    const product = this.productCatalog.getBySku(sku);
    if (!product) {
      return;
    }
    this.cartService.add(product);
    this.wishlistService.remove(sku);
  }
}
