import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuditEntry } from '../services/audit-log/audit-log.service';
import { API_CONFIG } from './api-config.token';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  saveEntry(entry: AuditEntry): Observable<void> {
    return this.http.post<void>(`${this.apiConfig.baseUrl}/audit-entries`, entry);
  }

  listEntries(): Observable<AuditEntry[]> {
    return this.http.get<AuditEntry[]>(`${this.apiConfig.baseUrl}/audit-entries`);
  }
}
