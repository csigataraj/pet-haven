import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProductCatalogService, ReviewService, ShopActionsService, TranslateService } from '../../../../core';
import { EmptyStateComponent, PageHeaderComponent, PriceComponent, ProfileMenuComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-product-details',
  imports: [
    RouterLink,
    ProfileMenuComponent,
    PageHeaderComponent,
    PriceComponent,
    EmptyStateComponent,
    TranslatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap
  });
  private readonly productCatalog = inject(ProductCatalogService);
  private readonly reviewService = inject(ReviewService);
  private readonly translateService = inject(TranslateService);

  readonly shopActions = inject(ShopActionsService);
  readonly products = this.productCatalog.products;

  readonly reviewerName = signal('');
  readonly reviewerComment = signal('');
  readonly reviewerRating = signal(5);
  readonly reviewError = signal('');

  readonly sku = computed(() => this.paramMap().get('sku') ?? '');

  readonly product = computed(() => this.productCatalog.getBySku(this.sku()));

  readonly relatedProducts = computed(() => {
    const current = this.product();
    if (!current) {
      return [];
    }

    const sameCategory = this.products().filter(
      (item) => item.sku !== current.sku && item.category === current.category
    );

    const fallback = this.products().filter(
      (item) => item.sku !== current.sku && item.category !== current.category
    );

    return [...sameCategory, ...fallback].slice(0, 3);
  });

  readonly canAddToCart = computed(() => {
    const item = this.product();
    return this.shopActions.canAddProductToCart(item);
  });

  readonly reviews = computed(() => {
    const item = this.product();
    if (!item) {
      return [];
    }
    return this.reviewService.getBySku(item.sku);
  });

  readonly averageRating = computed(() => {
    const entries = this.reviews();
    if (entries.length === 0) {
      return 0;
    }
    const total = entries.reduce((sum, review) => sum + review.rating, 0);
    return total / entries.length;
  });

  readonly discountExpirationDate = computed(() => {
    const item = this.product();
    if (!item || !item.discountedPrice) {
      return null;
    }
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });

  readonly discountExpirationDateFormatted = computed(() => {
    const date = this.discountExpirationDate();
    if (!date) {
      return '';
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  });

  readonly isWishlisted = computed(() => {
    const item = this.product();
    if (!item) {
      return false;
    }
    return this.shopActions.isInWishlist(item.sku);
  });

  addToCart(): void {
    if (!this.canAddToCart()) {
      return;
    }

    this.shopActions.addToCart(this.product());
  }

  setReviewerName(value: string): void {
    this.reviewerName.set(value);
  }

  setReviewerComment(value: string): void {
    this.reviewerComment.set(value);
  }

  setReviewerRating(value: string): void {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    this.reviewerRating.set(Math.max(1, Math.min(5, parsed)));
  }

  submitReview(): void {
    const item = this.product();
    if (!item) {
      return;
    }

    const name = this.reviewerName().trim();
    const comment = this.reviewerComment().trim();

    if (name.length < 2 || comment.length < 5) {
      this.reviewError.set(this.translateService.t('shop.productDetails.reviewForm.errorShortReview'));
      return;
    }

    this.reviewService.addReview({
      sku: item.sku,
      author: name,
      rating: this.reviewerRating(),
      comment
    });

    this.reviewerComment.set('');
    this.reviewerRating.set(5);
    this.reviewError.set('');
  }

  toggleWishlist(): void {
    this.shopActions.toggleWishlist(this.product());
  }
}
