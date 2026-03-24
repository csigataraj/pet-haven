import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  AccountLabelsService,
  AccountOrdersService,
  isDeliveredTimelineStatus,
  isOrderCancelled,
  isRefundedStatus,
  isReturnApprovedStatus,
  isReturnRequestedStatus,
  isShippedTimelineStatus
} from '../../../../core';
import { TranslateService } from '../../../../core';
import { EmptyStateComponent, PageHeaderComponent, PriceComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-order-details',
  imports: [RouterLink, PageHeaderComponent, PriceComponent, EmptyStateComponent, TranslatePipe],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly accountOrders = inject(AccountOrdersService);
  private readonly translateService = inject(TranslateService);
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap
  });

  readonly currentUser = this.accountOrders.currentUser;
  readonly orderId = computed(() => this.paramMap().get('id') ?? '');
  readonly labels = inject(AccountLabelsService);

  readonly order = computed(() => this.accountOrders.findOrder(this.orderId()));

  readonly timeline = computed(() => {
    const order = this.order();
    if (!order) {
      return [];
    }

    const steps = [
      {
        key: 'placed',
        label: this.translateService.t('account.orderDetails.timeline.placed'),
        active: true,
        note: this.translateService.t('account.orderDetails.timelineNote.placed', { date: order.date })
      },
      {
        key: 'processing',
        label: this.translateService.t('account.orderDetails.timeline.processing'),
        active: !isOrderCancelled(order.status),
        note: isOrderCancelled(order.status)
          ? this.translateService.t('account.orderDetails.timelineNote.processingCancelled')
          : this.translateService.t('account.orderDetails.timelineNote.processingActive')
      },
      {
        key: 'shipped',
        label: this.translateService.t('account.orderDetails.timeline.shipped'),
        active: isShippedTimelineStatus(order.status),
        note: order.trackingCode
      },
      {
        key: 'delivered',
        label: this.translateService.t('account.orderDetails.timeline.delivered'),
        active: isDeliveredTimelineStatus(order.status),
        note: order.status === 'Delivered'
          ? this.translateService.t('account.orderDetails.timelineNote.deliveredEta', { date: order.etaDate })
          : this.translateService.t('account.orderDetails.timelineNote.deliveredPast')
      },
      {
        key: 'return-requested',
        label: this.translateService.t('account.orderDetails.timeline.returnRequested'),
        active: isReturnRequestedStatus(order.status) || isReturnApprovedStatus(order.status) || isRefundedStatus(order.status),
        note: order.returnReason ?? ''
      },
      {
        key: 'return-approved',
        label: this.translateService.t('account.orderDetails.timeline.returnApproved'),
        active: isReturnApprovedStatus(order.status) || isRefundedStatus(order.status),
        note:
          isReturnApprovedStatus(order.status) || isRefundedStatus(order.status)
            ? this.translateService.t('account.orderDetails.timelineNote.returnApproved', {
                label: order.returnLabelCode ? ` - ${order.returnLabelCode}` : ''
              })
            : ''
      },
      {
        key: 'refunded',
        label: this.translateService.t('account.orderDetails.timeline.refunded'),
        active: isRefundedStatus(order.status),
        note:
          isRefundedStatus(order.status)
            ? this.translateService.t('account.orderDetails.timelineNote.refunded', {
                tracking: order.returnTrackingCode ? ` - ${order.returnTrackingCode}` : ''
              })
            : ''
      },
      {
        key: 'cancelled',
        label: this.translateService.t('account.orderDetails.timeline.cancelled'),
        active: isOrderCancelled(order.status),
        note: isOrderCancelled(order.status)
          ? this.translateService.t('account.orderDetails.timelineNote.cancelled')
          : ''
      }
    ];

    return steps;
  });

  readonly returnEvents = computed(() => {
    const order = this.order();
    if (!order) {
      return [];
    }

    return [...order.returnEvents]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((event) => ({
        ...event,
        label: this.labels.returnEvent(event.code)
      }));
  });
}
