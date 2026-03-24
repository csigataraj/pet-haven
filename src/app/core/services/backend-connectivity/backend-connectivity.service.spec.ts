import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { API_CONFIG } from '../../api/api-config.token';
import { BackendConnectivityService } from './backend-connectivity.service';

describe('BackendConnectivityService', () => {
  it('stays disabled when API is disabled', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BackendConnectivityService,
        { provide: API_CONFIG, useValue: { enabled: false, baseUrl: '/api' } }
      ]
    });

    const service = TestBed.inject(BackendConnectivityService);
    const httpMock = TestBed.inject(HttpTestingController);

    expect(service.status()).toBe('disabled');
    httpMock.expectNone('/api/health');
  });

  it('sets healthy when health endpoint responds ok', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BackendConnectivityService,
        { provide: API_CONFIG, useValue: { enabled: true, baseUrl: '/api' } }
      ]
    });

    const service = TestBed.inject(BackendConnectivityService);
    const httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne('/api/health');
    req.flush({ ok: true, service: 'mock' });

    expect(service.status()).toBe('healthy');
    expect(service.lastCheck()).toBeGreaterThan(0);
    httpMock.verify();
  });
});
