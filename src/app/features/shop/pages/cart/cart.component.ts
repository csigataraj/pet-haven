import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { CartService } from '../../../../core';
import { PageHeaderComponent, PriceComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, PageHeaderComponent, PriceComponent, TranslatePipe, MatButtonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  increment(sku: string, current: number): void {
    this.cartService.updateQuantity(sku, current + 1);
  }

  decrement(sku: string, current: number): void {
    this.cartService.updateQuantity(sku, current - 1);
  }

  remove(sku: string): void {
    this.cartService.remove(sku);
  }

  checkout(): void {
    this.router.navigateByUrl('/checkout');
  }
}
