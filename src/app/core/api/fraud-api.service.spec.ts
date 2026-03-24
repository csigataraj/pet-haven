import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { API_CONFIG } from './api-config.token';
import { FraudApiService } from './fraud-api.service';

describe('FraudApiService', () => {
  let service: FraudApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FraudApiService, { provide: API_CONFIG, useValue: { enabled: true, baseUrl: '/api' } }]
    });

    service = TestBed.inject(FraudApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists blocked events', () => {
    service.listBlockedEvents().subscribe();
    const req = httpMock.expectOne('/api/fraud-events');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('sets fraud disposition', () => {
    service.setDisposition('FR-1', 'closed').subscribe();
    const req = httpMock.expectOne('/api/fraud-events/FR-1/disposition');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ disposition: 'closed' });
    req.flush({});
  });
});
