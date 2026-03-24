import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProductCatalogService, ShopActionsService } from '../../../../core';
import { PageHeaderComponent, PriceComponent, ProfileMenuComponent, TranslatePipe } from '../../../../shared/components';
import { SORT_OPTIONS, SortOption, filterAndSortProducts, findCategoryBySlug } from '../../data';

@Component({
  selector: 'app-category',
  imports: [
    RouterLink,
    PageHeaderComponent,
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
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap
  });
  private readonly catalogService = inject(ProductCatalogService);

  readonly shopActions = inject(ShopActionsService);
  readonly products = this.catalogService.products;
  readonly searchTerm = signal('');
  readonly inStockOnly = signal(false);
  readonly sortBy = signal<SortOption>('featured');

  readonly sortOptions = SORT_OPTIONS;

  readonly currentCategory = computed(() => {
    return findCategoryBySlug(this.products(), this.paramMap().get('category') ?? '');
  });

  readonly filteredProducts = computed(() => {
    const category = this.currentCategory();
    if (!category) {
      return [];
    }

    return filterAndSortProducts(this.products(), {
      query: this.searchTerm(),
      category,
      inStockOnly: this.inStockOnly(),
      sort: this.sortBy()
    });
  });

  setSearch(value: string): void {
    this.searchTerm.set(value);
  }

  setSort(value: string): void {
    this.sortBy.set(value as SortOption);
  }

  setStockOnly(enabled: boolean): void {
    this.inStockOnly.set(enabled);
  }
}
