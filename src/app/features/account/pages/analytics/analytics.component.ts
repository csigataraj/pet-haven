import { Component, computed, inject } from '@angular/core';

import { OrderService } from '../../../../core';
import { PageHeaderComponent, PriceComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-analytics',
  imports: [PageHeaderComponent, PriceComponent, TranslatePipe],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  private readonly orderService = inject(OrderService);

  readonly orders = this.orderService.orders;

  readonly totalRevenue = computed(() =>
    this.orders().reduce((sum, order) => sum + order.total, 0)
  );

  readonly averageOrderValue = computed(() => {
    if (this.orders().length === 0) {
      return 0;
    }
    return this.totalRevenue() / this.orders().length;
  });

  readonly totalUnitsSold = computed(() =>
    this.orders().reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    )
  );

  readonly topProducts = computed(() => {
    const map = new Map<string, { name: string; units: number }>();

    for (const order of this.orders()) {
      for (const item of order.items) {
        const current = map.get(item.sku);
        if (current) {
          current.units += item.quantity;
        } else {
          map.set(item.sku, { name: item.name, units: item.quantity });
        }
      }
    }

    return Array.from(map.entries())
      .map(([sku, value]) => ({ sku, ...value }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  });
}
