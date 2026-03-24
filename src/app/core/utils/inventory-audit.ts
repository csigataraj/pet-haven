export function buildInventoryStockDetail(stock: number): string {
  return `Stock set to ${stock}`;
}

export function buildInventoryPriceDetail(price: number): string {
  return `Price set to ${price}`;
}

export function buildInventoryCreateDetail(name: string, category: string): string {
  return `${name} (${category})`;
}

export function buildInventoryRemoveDetail(): string {
  return 'Product removed from catalog';
}
