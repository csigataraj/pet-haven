import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AuthService, CartService, ProductCatalogService, ShopActionsService, TranslateService } from '../../../../core';
import { LanguageSwitcherComponent, PriceComponent, ProfileMenuComponent, TranslatePipe } from '../../../../shared/components';
import { SORT_OPTIONS, SortOption, filterAndSortProducts, getProductCategories } from '../../data';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    LanguageSwitcherComponent,
    ProfileMenuComponent,
    PriceComponent,
    TranslatePipe,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly productCatalog = inject(ProductCatalogService);
  private readonly cartService = inject(CartService);
  private readonly translateService = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly shopActions = inject(ShopActionsService);
  readonly products = this.productCatalog.products;
  readonly cartTotalCount = this.cartService.totalCount;
  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly sortOptions = SORT_OPTIONS;

  readonly selectedCategories = signal(new Set<string>());
  readonly searchTerm = signal('');
  readonly inStockOnly = signal(false);
  readonly sortBy = signal<SortOption>('featured');
  readonly showWishlistAuthModal = signal(false);

  readonly categories = computed(() => getProductCategories(this.products(), false));

  readonly productCards = computed(() => {
    const selected = this.selectedCategories();
    const categoryToFilterBy = selected.size === 0 ? null : Array.from(selected)[0];

    return filterAndSortProducts(this.products(), {
      query: this.searchTerm(),
      category: categoryToFilterBy,
      inStockOnly: this.inStockOnly(),
      sort: this.sortBy(),
      includeCategoryInSearch: true
    });
  });

  setSearch(term: string): void {
    this.searchTerm.set(term);
  }

  setCategory(category: string, checked: boolean): void {
    const updated = new Set(this.selectedCategories());
    if (checked) {
      updated.clear();
      updated.add(category);
    } else {
      updated.delete(category);
    }
    this.selectedCategories.set(updated);
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().has(category);
  }

  setSort(value: string): void {
    this.sortBy.set(value as SortOption);
  }

  toggleInStockOnly(enabled: boolean): void {
    this.inStockOnly.set(enabled);
  }

  onWishlistClick(sku: string): void {
    if (!this.isAuthenticated()) {
      this.showWishlistAuthModal.set(true);
      return;
    }

    this.shopActions.toggleWishlistBySku(sku);
  }

  closeWishlistAuthModal(): void {
    this.showWishlistAuthModal.set(false);
  }

  goToLoginFromWishlistModal(): void {
    this.closeWishlistAuthModal();
    this.router.navigate(['/login']);
  }

  goToSignupFromWishlistModal(): void {
    this.closeWishlistAuthModal();
    this.router.navigate(['/signup']);
  }

  categoryLabel(category: string): string {
    const key = `shop.home.categories.${category.toLowerCase()}`;
    const translated = this.translateService.t(key);
    return translated === key ? category : translated;
  }
}
