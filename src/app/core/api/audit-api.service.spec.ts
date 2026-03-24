import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { API_CONFIG } from './api-config.token';
import { AuditApiService } from './audit-api.service';
import { AuditEntry } from '../services/audit-log/audit-log.service';

describe('AuditApiService', () => {
  let service: AuditApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuditApiService, { provide: API_CONFIG, useValue: { enabled: true, baseUrl: '/api' } }]
    });

    service = TestBed.inject(AuditApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('saves audit entry', () => {
    const entry: AuditEntry = {
      id: 'AL-1',
      area: 'orders',
      action: 'set-status',
      targetId: 'PH-1',
      details: 'ok',
      actor: 'admin',
      timestamp: Date.now(),
      hash: 'abc',
      prevHash: ''
    };

    service.saveEntry(entry).subscribe();

    const req = httpMock.expectOne('/api/audit-entries');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(entry);
    req.flush({});
  });

  it('lists audit entries', () => {
    service.listEntries().subscribe();
    const req = httpMock.expectOne('/api/audit-entries');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
