import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuditLogService } from '../audit-log/audit-log.service';
import { PaymentService } from './payment.service';

describe('PaymentService audit logging', () => {
  let service: PaymentService;
  let auditLog: { log: jasmine.Spy };

  beforeEach(() => {
    localStorage.clear();
    auditLog = {
      log: jasmine.createSpy('log')
    };

    TestBed.configureTestingModule({
      providers: [
        PaymentService,
        { provide: AuditLogService, useValue: auditLog },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PaymentService);
  });

  it('logs allowlist and case review actions', () => {
    service.allowlistEmail('Admin@PetHaven.com');
    service.allowlistFingerprint('ABCD:12/30:admin user');

    expect(auditLog.log).toHaveBeenCalledWith('fraud', 'allowlist-email', 'admin@pethaven.com', 'Email added to allowlist');
    expect(auditLog.log).toHaveBeenCalledWith('fraud', 'allowlist-fingerprint', 'abcd:12/30:admin user', 'Fingerprint added to allowlist');

    service.reviewBlockedEvent('FR-10001', 'Reviewed by staff');
    expect(auditLog.log).toHaveBeenCalledWith('fraud', 'review-case', 'FR-10001', 'Reviewed by staff');
  });

  it('logs blocked attempts and escalation workflow', () => {
    const input = {
      customerEmail: 'risk@example.com',
      cardHolder: 'Risk User',
      cardNumber: '4111111111111111',
      expiry: '12/30',
      cvv: '123',
      amount: 19.99,
      currencyCode: 'USD'
    };

    service.authorizeCard(input);
    service.authorizeCard(input);
    service.authorizeCard(input);
    const blocked = service.authorizeCard(input);

    expect(blocked.ok).toBeFalse();

    const eventId = service.blockedEvents()[0].id;
    expect(auditLog.log).toHaveBeenCalledWith(
      'fraud',
      'blocked-attempt',
      eventId,
      jasmine.stringMatching('risk@example.com - Velocity limit exceeded'),
      'system'
    );

    service.setDisposition(eventId, 'card-testing');
    service.setEscalated(eventId, true);

    expect(auditLog.log).toHaveBeenCalledWith('fraud', 'set-disposition', eventId, 'card-testing');
    expect(auditLog.log).toHaveBeenCalledWith('fraud', 'escalate-case', eventId, 'Escalated');
  });
});
