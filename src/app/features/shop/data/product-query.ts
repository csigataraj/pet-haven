import { Product, SortOption } from './product-data';

export interface ProductQueryOptions {
  query: string;
  category?: string | null;
  inStockOnly: boolean;
  sort: SortOption;
  includeCategoryInSearch?: boolean;
}

export function getProductCategories(products: Product[], includeAll = false): string[] {
  const categories = [...new Set(products.map((product) => product.category))];
  return includeAll ? ['All', ...categories] : categories;
}

export function filterAndSortProducts(products: Product[], options: ProductQueryOptions): Product[] {
  const query = options.query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    if (options.category && product.category !== options.category) {
      return false;
    }

    if (options.inStockOnly && product.stock < 1) {
      return false;
    }

    if (!query) {
      return true;
    }

    return matchesProductQuery(product, query, options.includeCategoryInSearch ?? false);
  });

  if (options.sort === 'featured') {
    return filtered;
  }

  return [...filtered].sort((a, b) => {
    if (options.sort === 'price-asc') {
      return a.price - b.price;
    }
    if (options.sort === 'price-desc') {
      return b.price - a.price;
    }
    if (options.sort === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    return b.stock - a.stock;
  });
}

function matchesProductQuery(product: Product, query: string, includeCategoryInSearch: boolean): boolean {
  if (product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)) {
    return true;
  }

  return includeCategoryInSearch && product.category.toLowerCase().includes(query);
}
