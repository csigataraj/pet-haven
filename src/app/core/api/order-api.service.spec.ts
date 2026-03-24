import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { API_CONFIG } from './api-config.token';
import { OrderApiService } from './order-api.service';

describe('OrderApiService', () => {
  let service: OrderApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderApiService, { provide: API_CONFIG, useValue: { enabled: true, baseUrl: '/api' } }]
    });

    service = TestBed.inject(OrderApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('calls list endpoint with email param', () => {
    service.listOrdersForEmail('user@example.com').subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/orders' && r.params.get('email') === 'user@example.com');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('calls status update endpoint', () => {
    service.updateStatus('PH-1', 'Shipped').subscribe();

    const req = httpMock.expectOne('/api/orders/PH-1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'Shipped' });
    req.flush({});
  });
});
