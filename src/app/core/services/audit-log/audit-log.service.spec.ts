import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from '../../auth';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AuditLogService, AuthService, provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it('creates a valid hash chain for new entries', () => {
    const service = TestBed.inject(AuditLogService);

    service.log('fraud', 'review-case', 'FR-10001', 'Reviewed by admin', 'admin');
    service.log('returns', 'approve-return', 'PH-20001', 'Approved and labeled', 'admin');

    expect(service.entries().length).toBe(2);
    expect(service.chainValid()).toBeTrue();
    expect(service.entries()[0].prevHash).toBe(service.entries()[1].hash);
  });

  it('detects tampering when persisted entry payload changes', () => {
    let service = TestBed.inject(AuditLogService);
    service.log('fraud', 'blocked-attempt', 'FR-30001', 'Velocity limit exceeded', 'system');

    const stored = localStorage.getItem('pet1.auditLog');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored ?? '[]') as { details: string }[];
    parsed[0].details = 'Tampered details';
    localStorage.setItem('pet1.auditLog', JSON.stringify(parsed));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AuditLogService, AuthService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuditLogService);
    expect(service.chainValid()).toBeFalse();
  });

  it('exports escaped CSV rows', () => {
    const service = TestBed.inject(AuditLogService);
    service.log('inventory', 'set-name', 'SKU-1', 'Name with "quote", and comma', 'admin');

    const csv = service.toCsv(service.entries());
    expect(csv).toContain('id,timestamp,actor,area,action,targetId,details,prevHash,hash');
    expect(csv).toContain('"Name with ""quote"", and comma"');
  });
});
