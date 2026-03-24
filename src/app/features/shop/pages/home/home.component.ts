import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CartService, ProductCatalogService, ShopActionsService, TranslateService } from '../../../../core';
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

  readonly shopActions = inject(ShopActionsService);
  readonly products = this.productCatalog.products;
  readonly cartTotalCount = this.cartService.totalCount;

  readonly sortOptions = SORT_OPTIONS;

  readonly selectedCategory = signal(this.route.snapshot.queryParamMap.get('category') ?? 'All');
  readonly searchTerm = signal('');
  readonly inStockOnly = signal(false);
  readonly sortBy = signal<SortOption>('featured');

  readonly categories = computed(() => getProductCategories(this.products(), true));

  readonly productCards = computed(() =>
    filterAndSortProducts(this.products(), {
      query: this.searchTerm(),
      category: this.selectedCategory() === 'All' ? null : this.selectedCategory(),
      inStockOnly: this.inStockOnly(),
      sort: this.sortBy(),
      includeCategoryInSearch: true
    })
  );

  setSearch(term: string): void {
    this.searchTerm.set(term);
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  setSort(value: string): void {
    this.sortBy.set(value as SortOption);
  }

  toggleInStockOnly(enabled: boolean): void {
    this.inStockOnly.set(enabled);
  }

  categoryLabel(category: string): string {
    const key = `shop.home.categories.${category.toLowerCase()}`;
    const translated = this.translateService.t(key);
    return translated === key ? category : translated;
  }
}
