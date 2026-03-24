import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import {
  AccountLabelsService,
  AccountOrdersService,
  ORDER_TRACKING_STAGES,
  OrderService,
  OrderStatus,
  isClosedTrackingStatus,
  isOrderDelivered,
  isOrderProcessing,
  isReturnTrackedStatus
} from '../../../../core';
import { TranslateService } from '../../../../core';
import { EmptyStateComponent, PageHeaderComponent, PriceComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, MatButtonModule, EmptyStateComponent, PageHeaderComponent, PriceComponent, TranslatePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  private readonly accountOrders = inject(AccountOrdersService);
  private readonly orderService = inject(OrderService);
  private readonly translateService = inject(TranslateService);

  readonly currentUser = this.accountOrders.currentUser;
  readonly orders = this.accountOrders.userOrders;
  readonly labels = inject(AccountLabelsService);

  readonly trackingStages = ORDER_TRACKING_STAGES;

  isStageActive(status: OrderStatus, stage: (typeof ORDER_TRACKING_STAGES)[number]): boolean {
    if (isClosedTrackingStatus(status)) {
      return false;
    }

    const statusIndex = this.trackingStages.indexOf(status as (typeof ORDER_TRACKING_STAGES)[number]);
    if (statusIndex < 0) {
      return false;
    }

    return statusIndex >= this.trackingStages.indexOf(stage);
  }

  canCancel(status: OrderStatus): boolean {
    return isOrderProcessing(status);
  }

  canRequestReturn(status: OrderStatus): boolean {
    return isOrderDelivered(status);
  }

  canTrackReturn(status: OrderStatus): boolean {
    return isReturnTrackedStatus(status);
  }

  cancelOrder(orderId: string): void {
    this.orderService.cancelOrder(orderId);
  }

  requestReturn(orderId: string): void {
    const reason = window.prompt(
      this.translateService.t('account.orders.returnPrompt.message'),
      this.translateService.t('account.orders.returnPrompt.defaultReason')
    );
    if (reason === null) {
      return;
    }
    this.orderService.requestReturnWithReason(orderId, reason);
  }
}
