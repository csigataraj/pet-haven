import { Injectable, inject } from '@angular/core';

import { NotificationType } from '../notification/notification.service';
import { OrderStatus, ReturnEventCode } from '../order/order.service';
import { FraudDisposition } from '../payment/payment.service';
import { TranslateService } from '../translate/translate.service';

type PaymentMethod = 'card' | 'cash-on-delivery';

const ORDER_STATUS_LABEL_KEYS: Record<OrderStatus, string> = {
  Processing: 'account.admin.orderStatus.processing',
  Shipped: 'account.admin.orderStatus.shipped',
  Delivered: 'account.admin.orderStatus.delivered',
  Cancelled: 'account.admin.orderStatus.cancelled',
  ReturnRequested: 'account.admin.orderStatus.returnRequested',
  ReturnApproved: 'account.admin.orderStatus.returnApproved',
  Refunded: 'account.admin.orderStatus.refunded',
  Returned: 'account.admin.orderStatus.returned'
};

const RETURN_EVENT_LABEL_KEYS: Record<ReturnEventCode, string> = {
  requested: 'account.orderDetails.returnEvent.requested',
  approved: 'account.orderDetails.returnEvent.approved',
  'label-created': 'account.orderDetails.returnEvent.label-created',
  'in-transit': 'account.orderDetails.returnEvent.in-transit',
  received: 'account.orderDetails.returnEvent.received',
  refunded: 'account.orderDetails.returnEvent.refunded'
};

const FRAUD_DISPOSITION_LABEL_KEYS: Record<FraudDisposition, string> = {
  open: 'account.fraudCase.open',
  'false-positive': 'account.fraudCase.falsePositive',
  'card-testing': 'account.fraudCase.cardTesting',
  'account-takeover': 'account.fraudCase.accountTakeover',
  'friendly-fraud': 'account.fraudCase.friendlyFraud',
  closed: 'account.fraudCase.closed'
};

const NOTIFICATION_TYPE_LABEL_KEYS: Record<NotificationType, string> = {
  'order-confirmation': 'account.notifications.type.orderConfirmation',
  welcome: 'account.notifications.type.welcome',
  'account-created': 'account.notifications.type.accountCreated'
};

const PAYMENT_METHOD_LABEL_KEYS: Record<PaymentMethod, string> = {
  card: 'shop.checkout.card',
  'cash-on-delivery': 'account.admin.cashOnDelivery'
};

@Injectable({ providedIn: 'root' })
export class AccountLabelsService {
  private readonly translateService = inject(TranslateService);

  orderStatus(status: OrderStatus): string {
    return this.translateService.t(ORDER_STATUS_LABEL_KEYS[status]);
  }

  returnEvent(code: ReturnEventCode): string {
    return this.translateService.t(RETURN_EVENT_LABEL_KEYS[code]);
  }

  fraudDisposition(disposition: FraudDisposition): string {
    return this.translateService.t(FRAUD_DISPOSITION_LABEL_KEYS[disposition]);
  }

  notificationType(type: NotificationType): string {
    return this.translateService.t(NOTIFICATION_TYPE_LABEL_KEYS[type]);
  }

  paymentMethod(method: PaymentMethod): string {
    return this.translateService.t(PAYMENT_METHOD_LABEL_KEYS[method]);
  }
}
