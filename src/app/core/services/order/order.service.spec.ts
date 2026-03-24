import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuditLogService } from '../audit-log/audit-log.service';
import { OrderService, PlaceOrderInput } from './order.service';

describe('OrderService audit logging', () => {
  let service: OrderService;
  let auditLog: { log: jasmine.Spy };

  const orderInput: PlaceOrderInput = {
    customerName: 'Casey Customer',
    customerEmail: 'casey@example.com',
    shippingAddress: '123 Main Street',
    city: 'Budapest',
    postalCode: '1111',
    country: 'Hungary',
    shippingMethod: 'standard',
    paymentMethod: 'card',
    couponCode: null,
    items: [{ sku: 'PET-001', name: 'Dog Food', quantity: 1, unitPrice: 12 }],
    subtotal: 12,
    discount: 0,
    shippingCost: 2,
    tax: 1,
    currencyCode: 'USD',
    paymentAuthCode: 'AUTH-123456',
    paymentCardLast4: '1111',
    paymentCardFingerprint: '1111:12/30:casey customer'
  };

  beforeEach(() => {
    localStorage.clear();
    auditLog = {
      log: jasmine.createSpy('log')
    };

    TestBed.configureTestingModule({
      providers: [
        OrderService,
        { provide: AuditLogService, useValue: auditLog },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(OrderService);
  });

  it('logs order status and cancel actions', () => {
    const order = service.placeOrder(orderInput);

    service.updateStatus(order.id, 'Shipped');
    expect(auditLog.log).toHaveBeenCalledWith('orders', 'set-status', order.id, 'Shipped');

    service.cancelOrder(order.id);
    expect(auditLog.log).toHaveBeenCalledWith('orders', 'cancel-order', order.id, 'Cancelled by customer');
  });

  it('logs return lifecycle actions', () => {
    const order = service.placeOrder(orderInput);

    service.updateStatus(order.id, 'Delivered');
    service.requestReturnWithReason(order.id, 'Wrong size');
    service.approveReturn(order.id);
    service.markReturnInTransit(order.id);
    service.markReturnReceived(order.id);
    service.markRefunded(order.id);

    expect(auditLog.log).toHaveBeenCalledWith('returns', 'request-return', order.id, 'Wrong size', 'customer');
    expect(auditLog.log).toHaveBeenCalledWith('returns', 'approve-return', order.id, 'Return approved and label generated');
    expect(auditLog.log).toHaveBeenCalledWith('returns', 'mark-in-transit', order.id, 'Carrier scan marked in transit');
    expect(auditLog.log).toHaveBeenCalledWith('returns', 'mark-received', order.id, 'Warehouse received return package');
    expect(auditLog.log).toHaveBeenCalledWith('returns', 'mark-refunded', order.id, 'Refund completed');
  });
});
