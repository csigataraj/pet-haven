import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FraudBlockedEvent, FraudDisposition } from '../services/payment/payment.service';
import { API_CONFIG } from './api-config.token';

@Injectable({ providedIn: 'root' })
export class FraudApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  listBlockedEvents(): Observable<FraudBlockedEvent[]> {
    return this.http.get<FraudBlockedEvent[]>(`${this.apiConfig.baseUrl}/fraud-events`);
  }

  setDisposition(eventId: string, disposition: FraudDisposition): Observable<void> {
    return this.http.patch<void>(`${this.apiConfig.baseUrl}/fraud-events/${eventId}/disposition`, {
      disposition
    });
  }

  setEscalated(eventId: string, escalated: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiConfig.baseUrl}/fraud-events/${eventId}/escalation`, {
      escalated
    });
  }

  reviewBlockedEvent(eventId: string, note: string): Observable<void> {
    return this.http.patch<void>(`${this.apiConfig.baseUrl}/fraud-events/${eventId}/review`, {
      note
    });
  }

  allowlistEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiConfig.baseUrl}/fraud-events/allowlist/email`, { email });
  }

  allowlistFingerprint(fingerprint: string): Observable<void> {
    return this.http.post<void>(`${this.apiConfig.baseUrl}/fraud-events/allowlist/fingerprint`, { fingerprint });
  }

  unlockVelocity(email: string, fingerprint: string): Observable<void> {
    return this.http.post<void>(`${this.apiConfig.baseUrl}/fraud-events/velocity/unlock`, { email, fingerprint });
  }
}
