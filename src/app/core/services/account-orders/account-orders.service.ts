import { Injectable, computed, inject } from '@angular/core';

import { AuthService } from '../../auth';
import { OrderService, PlacedOrder, isReturnTrackedStatus } from '../order/order.service';

@Injectable({ providedIn: 'root' })
export class AccountOrdersService {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);

  readonly currentUser = this.authService.currentUser;

  readonly userOrders = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return [];
    }

    return this.orderService.getOrdersForEmail(user.email);
  });

  readonly returnedOrders = computed(() =>
    this.userOrders().filter((order) => isReturnTrackedStatus(order.status))
  );

  findOrder(orderId: string): PlacedOrder | null {
    return this.userOrders().find((item) => item.id === orderId) ?? null;
  }
}
