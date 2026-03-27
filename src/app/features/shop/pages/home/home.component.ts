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
  private static readonly NEWEST_FILTER = 'Newest';
  private static readonly CARE_CATEGORIES = ['Sleep', 'Grooming', 'Health'] as const;
  private static readonly FOOD_CATEGORIES = ['Food', 'Feeding'] as const;
  private static readonly PLAY_AND_TRAVEL_CATEGORIES = ['Toys', 'Walking', 'Travel', 'Training'] as const;

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
  readonly sortBy = signal<SortOption>('featured');
  readonly showWishlistAuthModal = signal(false);

  readonly categories = computed(() => getProductCategories(this.products(), false));
  readonly mobileSelectedFilters = computed(() => [...this.selectedCategories()]);
  readonly mobileSortIndex = computed(() => {
    const index = this.sortOptions.findIndex((option) => option.value === this.sortBy());
    return index >= 0 ? index + 1 : 1;
  });
  readonly filterGroups = computed(() => {
    const categories = this.categories();

    const selectInOrder = (orderedCategories: readonly string[]) =>
      orderedCategories.filter((category) => categories.includes(category));

    const care = selectInOrder(HomeComponent.CARE_CATEGORIES);
    const food = selectInOrder(HomeComponent.FOOD_CATEGORIES);
    const playAndTravel = selectInOrder(HomeComponent.PLAY_AND_TRAVEL_CATEGORIES);
    const mapped = new Set([...care, ...food, ...playAndTravel]);
    const moreCategories = categories.filter((category) => !mapped.has(category));

    return [
      { labelKey: 'shop.home.filterGroups.newAndTrending', options: [HomeComponent.NEWEST_FILTER] },
      { labelKey: 'shop.home.filterGroups.careAndWellness', options: care },
      { labelKey: 'shop.home.filterGroups.foodAndFeeding', options: food },
      { labelKey: 'shop.home.filterGroups.playAndTravel', options: playAndTravel },
      { labelKey: 'shop.home.filterGroups.moreCategories', options: moreCategories }
    ].filter((group) => group.options.length > 0);
  });

  readonly productCards = computed(() => {
    const selectedOptions = this.selectedCategories();
    const newestSelected = selectedOptions.has(HomeComponent.NEWEST_FILTER);
    const selectedCategoryFilters = [...selectedOptions].filter((option) => option !== HomeComponent.NEWEST_FILTER);

    const sortedProducts = filterAndSortProducts(this.products(), {
      query: this.searchTerm(),
      category: null,
      sort: this.sortBy(),
      includeCategoryInSearch: true
    });

    return sortedProducts.filter((product) => {
      if (selectedCategoryFilters.length > 0 && !selectedCategoryFilters.includes(product.category)) {
        return false;
      }

      if (newestSelected && !product.isNew) {
        return false;
      }

      return true;
    });
  });

  setSearch(term: string): void {
    this.searchTerm.set(term);
  }

  setCategory(category: string, checked: boolean): void {
    const updated = new Set(this.selectedCategories());
    if (checked) {
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

  setMobileFilters(values: string[]): void {
    this.selectedCategories.set(new Set(values ?? []));
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
