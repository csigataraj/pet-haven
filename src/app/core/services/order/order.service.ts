import { Injectable, Injector, inject, signal } from '@angular/core';

import { createPrefixedId } from '../../utils/id';
import { runBackendEffect } from '../../utils/backend-sync';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { AuditLogService } from '../audit-log/audit-log.service';
import { API_CONFIG } from '../../api/api-config.token';
import { OrderApiService } from '../../api/order-api.service';

export type OrderStatus =
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'ReturnRequested'
  | 'ReturnApproved'
  | 'Refunded'
  | 'Returned';

export const ORDER_TRACKING_STAGES = ['Processing', 'Shipped', 'Delivered'] as const;

export const ORDER_STATUS_SELECT_OPTIONS: ReadonlyArray<{ value: OrderStatus; labelKey: string }> = [
  { value: 'Processing', labelKey: 'account.admin.orderStatus.processing' },
  { value: 'Shipped', labelKey: 'account.admin.orderStatus.shipped' },
  { value: 'Delivered', labelKey: 'account.admin.orderStatus.delivered' },
  { value: 'Cancelled', labelKey: 'account.admin.orderStatus.cancelled' },
  { value: 'ReturnRequested', labelKey: 'account.admin.orderStatus.returnRequested' },
  { value: 'ReturnApproved', labelKey: 'account.admin.orderStatus.returnApproved' },
  { value: 'Refunded', labelKey: 'account.admin.orderStatus.refunded' },
  { value: 'Returned', labelKey: 'account.admin.orderStatus.returned' }
];

const RETURNABLE_ORDER_STATUSES: OrderStatus[] = ['ReturnRequested', 'ReturnApproved', 'Refunded'];
const SHIPPED_ORDER_STATUSES: OrderStatus[] = ['Shipped', 'Delivered', ...RETURNABLE_ORDER_STATUSES];
const DELIVERED_ORDER_STATUSES: OrderStatus[] = ['Delivered', ...RETURNABLE_ORDER_STATUSES];
const CLOSED_TRACKING_ORDER_STATUSES: OrderStatus[] = ['Cancelled', ...RETURNABLE_ORDER_STATUSES];

export interface PlacedOrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface PlaceOrderInput {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: 'standard' | 'express' | 'pickup';
  paymentMethod: 'card' | 'cash-on-delivery';
  couponCode: string | null;
  items: PlacedOrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  currencyCode: string;
  paymentAuthCode: string | null;
  paymentCardLast4: string | null;
  paymentCardFingerprint: string | null;
}

export type ReturnEventCode =
  | 'requested'
  | 'approved'
  | 'label-created'
  | 'in-transit'
  | 'received'
  | 'refunded';

export interface ReturnEvent {
  code: ReturnEventCode;
  timestamp: number;
  note: string;
}

export interface PlacedOrder {
  id: string;
  date: string;
  etaDate: string;
  trackingCode: string;
  total: number;
  status: OrderStatus;
  returnReason: string | null;
  returnCarrier: string | null;
  returnLabelCode: string | null;
  returnTrackingCode: string | null;
  returnEvents: ReturnEvent[];
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: PlaceOrderInput['shippingMethod'];
  paymentMethod: PlaceOrderInput['paymentMethod'];
  couponCode: string | null;
  discount: number;
  tax: number;
  currencyCode: string;
  paymentAuthCode: string | null;
  paymentCardLast4: string | null;
  paymentCardFingerprint: string | null;
  items: PlacedOrderItem[];
}

const STORAGE_KEY = 'pet1.orders';

function createTrackingCode(): string {
  return createPrefixedId('TRK', 6);
}

function createReturnLabelCode(): string {
  return createPrefixedId('RMA', 6);
}

function createReturnTrackingCode(): string {
  return createPrefixedId('RTR', 6);
}

export function isReturnTrackedStatus(status: OrderStatus): boolean {
  return RETURNABLE_ORDER_STATUSES.includes(status);
}

export function isReturnRequestedStatus(status: OrderStatus): boolean {
  return status === 'ReturnRequested';
}

export function isReturnApprovedStatus(status: OrderStatus): boolean {
  return status === 'ReturnApproved';
}

export function isRefundedStatus(status: OrderStatus): boolean {
  return status === 'Refunded';
}

export function isOrderCancelled(status: OrderStatus): boolean {
  return status === 'Cancelled';
}

export function isOrderDelivered(status: OrderStatus): boolean {
  return status === 'Delivered';
}

export function isOrderProcessing(status: OrderStatus): boolean {
  return status === 'Processing';
}

export function isShippedTimelineStatus(status: OrderStatus): boolean {
  return SHIPPED_ORDER_STATUSES.includes(status);
}

export function isDeliveredTimelineStatus(status: OrderStatus): boolean {
  return DELIVERED_ORDER_STATUSES.includes(status);
}

export function isClosedTrackingStatus(status: OrderStatus): boolean {
  return CLOSED_TRACKING_ORDER_STATUSES.includes(status);
}

function estimateEtaDate(shippingMethod: PlaceOrderInput['shippingMethod']): string {
  const days = shippingMethod === 'express' ? 1 : shippingMethod === 'pickup' ? 0 : 3;
  const target = new Date();
  target.setDate(target.getDate() + days);
  return target.toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly auditLogService = inject(AuditLogService);
  private readonly injector = inject(Injector);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly ordersState = signal<PlacedOrder[]>(this.loadOrders());

  readonly orders = this.ordersState.asReadonly();

  placeOrder(input: PlaceOrderInput): PlacedOrder {
    const order: PlacedOrder = {
      id: createPrefixedId('PH', 5),
      date: new Date().toISOString().slice(0, 10),
      etaDate: estimateEtaDate(input.shippingMethod),
      trackingCode: createTrackingCode(),
      total: input.subtotal - input.discount + input.shippingCost + input.tax,
      status: 'Processing',
      returnReason: null,
      returnCarrier: null,
      returnLabelCode: null,
      returnTrackingCode: null,
      returnEvents: [],
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim().toLowerCase(),
      shippingAddress: input.shippingAddress.trim(),
      city: input.city.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country.trim(),
      shippingMethod: input.shippingMethod,
      paymentMethod: input.paymentMethod,
      couponCode: input.couponCode,
      discount: input.discount,
      tax: input.tax,
      currencyCode: input.currencyCode,
      paymentAuthCode: input.paymentAuthCode,
      paymentCardLast4: input.paymentCardLast4,
      paymentCardFingerprint: input.paymentCardFingerprint,
      items: input.items
    };

    this.ordersState.update((current) => [order, ...current]);
    this.persistOrders();

    runBackendEffect(this.apiConfig.enabled, this.orderApi?.placeOrder(input), order);

    return order;
  }

  getOrdersForEmail(email: string): PlacedOrder[] {
    const normalized = email.trim().toLowerCase();
    return this.ordersState().filter((order) => order.customerEmail === normalized);
  }

  updateStatus(orderId: string, status: OrderStatus): void {
    this.ordersState.update((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    this.persistOrders();
    this.auditLogService.log('orders', 'set-status', orderId, status);

    runBackendEffect(this.apiConfig.enabled, this.orderApi?.updateStatus(orderId, status), void 0);
  }

  cancelOrder(orderId: string): void {
    this.ordersState.update((current) =>
      current.map((order) =>
        order.id === orderId && order.status === 'Processing'
          ? { ...order, status: 'Cancelled' }
          : order
      )
    );
    this.persistOrders();
    this.auditLogService.log('orders', 'cancel-order', orderId, 'Cancelled by customer');

    runBackendEffect(this.apiConfig.enabled, this.orderApi?.cancelOrder(orderId), void 0);
  }

  requestReturn(orderId: string): void {
    this.requestReturnWithReason(orderId, 'No reason provided');
  }

  requestReturnWithReason(orderId: string, reason: string): void {
    const normalizedReason = reason.trim() || 'No reason provided';
    this.ordersState.update((current) =>
      current.map((order) =>
        order.id === orderId && order.status === 'Delivered'
          ? {
              ...order,
              status: 'ReturnRequested',
              returnReason: normalizedReason,
              returnEvents: this.upsertReturnEvent(order.returnEvents, 'requested', normalizedReason)
            }
          : order
      )
    );
    this.persistOrders();
    this.auditLogService.log('returns', 'request-return', orderId, normalizedReason, 'customer');

    runBackendEffect(this.apiConfig.enabled, this.orderApi?.requestReturn(orderId, normalizedReason), void 0);
  }

  approveReturn(orderId: string): void {
    this.ordersState.update((current) =>
      current.map((order) =>
        order.id === orderId && order.status === 'ReturnRequested'
          ? (() => {
              const carrier = order.returnCarrier ?? 'ParcelGo';
              const label = order.returnLabelCode ?? createReturnLabelCode();
              const tracking = order.returnTrackingCode ?? createReturnTrackingCode();
              const withApproval = this.upsertReturnEvent(
                order.returnEvents,
                'approved',
                'Return approved by support'
              );
              return {
                ...order,
                status: 'ReturnApproved',
                returnCarrier: carrier,
                returnLabelCode: label,
                returnTrackingCode: tracking,
                returnEvents: this.upsertReturnEvent(
                  withApproval,
                  'label-created',
                  `${carrier} ${tracking}`
                )
              };
            })()
          : order
      )
    );
    this.persistOrders();
    this.auditLogService.log('returns', 'approve-return', orderId, 'Return approved and label generated');

    runBackendEffect(this.apiConfig.enabled, this.orderApi?.approveReturn(orderId), void 0);
  }

  markReturnInTransit(orderId: string): void {
    this.ordersState.update((current) =>
      current.map((order) =>
        order.id === orderId && order.status === 'ReturnApproved'
          ? {
              ...order,
              returnEvents: this.upsertReturnEvent(
                order.returnEvents,
                'in-transit',
                order.returnTrackingCode ? `Tracking ${order.returnTrackingCode}` : 'Carrier scan received'
              )
            }
          : order
      )
    );
    this.persistOrders();
    this.auditLogService.log('returns', 'mark-in-transit', orderId, 'Carrier scan marked in transit');

    runBackendEffect(this.apiConfig.enabled, this.orderApi?.markReturnEvent(orderId, 'in-transit', 'Carrier scan marked in transit'), void 0);
  }

  markReturnReceived(orderId: string): void {
    this.ordersState.update((current) =>
      current.map((order) =>
        order.id === orderId && order.status === 'ReturnApproved'
          ? {
              ...order,
              status: 'Returned',
              returnEvents: this.upsertReturnEvent(order.returnEvents, 'received', 'Warehouse received package')
            }
          : order
      )
    );
    this.persistOrders();
    this.auditLogService.log('returns', 'mark-received', orderId, 'Warehouse received return package');

    runBackendEffect(this.apiConfig.enabled, this.orderApi?.markReturnEvent(orderId, 'received', 'Warehouse received return package'), void 0);
  }

  markRefunded(orderId: string): void {
    this.ordersState.update((current) =>
      current.map((order) =>
        order.id === orderId && (order.status === 'ReturnApproved' || order.status === 'Returned')
          ? {
              ...order,
              status: 'Refunded',
              returnEvents: this.upsertReturnEvent(order.returnEvents, 'refunded', 'Payment refunded')
            }
          : order
      )
    );
    this.persistOrders();
    this.auditLogService.log('returns', 'mark-refunded', orderId, 'Refund completed');

    runBackendEffect(this.apiConfig.enabled, this.orderApi?.markReturnEvent(orderId, 'refunded', 'Payment refunded'), void 0);
  }

  private loadOrders(): PlacedOrder[] {
    const parsed = loadFromStorage<PlacedOrder[]>(STORAGE_KEY, []);
    return parsed.map((order) => {
      if (order.status === 'Returned') {
        return {
          ...order,
          status: 'ReturnApproved',
          returnReason: order.returnReason ?? 'Legacy return',
          returnCarrier: order.returnCarrier ?? null,
          returnLabelCode: order.returnLabelCode ?? null,
          returnTrackingCode: order.returnTrackingCode ?? null,
          returnEvents: this.migrateReturnEvents({
            ...order,
            status: 'ReturnApproved'
          } as PlacedOrder)
        };
      }
      return {
        ...order,
        returnReason: order.returnReason ?? null,
        returnCarrier: order.returnCarrier ?? null,
        returnLabelCode: order.returnLabelCode ?? null,
        returnTrackingCode: order.returnTrackingCode ?? null,
        returnEvents: Array.isArray(order.returnEvents)
          ? order.returnEvents.filter((event) => !!event?.code && !!event?.timestamp)
          : this.migrateReturnEvents(order)
      };
    });
  }

  private persistOrders(): void {
    saveToStorage(STORAGE_KEY, this.ordersState());
  }

  private upsertReturnEvent(events: ReturnEvent[], code: ReturnEventCode, note: string): ReturnEvent[] {
    const existingIndex = events.findIndex((event) => event.code === code);
    if (existingIndex >= 0) {
      return events.map((event, index) =>
        index === existingIndex
          ? { ...event, note: note.trim() || event.note }
          : event
      );
    }

    return [
      ...events,
      {
        code,
        timestamp: Date.now(),
        note: note.trim()
      }
    ];
  }

  private migrateReturnEvents(order: PlacedOrder): ReturnEvent[] {
    const events: ReturnEvent[] = [];
    if (order.returnReason) {
      events.push({ code: 'requested', timestamp: Date.now(), note: order.returnReason });
    }
    if (order.status === 'ReturnApproved' || order.status === 'Refunded' || order.status === 'Returned') {
      events.push({ code: 'approved', timestamp: Date.now(), note: 'Return approved by support' });
      if (order.returnTrackingCode || order.returnLabelCode) {
        events.push({
          code: 'label-created',
          timestamp: Date.now(),
          note: `${order.returnCarrier ?? 'ParcelGo'} ${order.returnTrackingCode ?? ''}`.trim()
        });
      }
    }
    if (order.status === 'Returned' || order.status === 'Refunded') {
      events.push({ code: 'received', timestamp: Date.now(), note: 'Warehouse received package' });
    }
    if (order.status === 'Refunded') {
      events.push({ code: 'refunded', timestamp: Date.now(), note: 'Payment refunded' });
    }
    return events;
  }

  private get orderApi(): OrderApiService | null {
    return this.injector.get(OrderApiService, null);
  }
}
