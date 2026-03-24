import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { catchError, of, timeout } from 'rxjs';

import { API_CONFIG } from '../../api/api-config.token';

export type BackendStatus = 'healthy' | 'degraded' | 'offline' | 'disabled';

@Injectable({ providedIn: 'root' })
export class BackendConnectivityService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly statusState = signal<BackendStatus>('disabled');
  private readonly lastCheckState = signal<number>(0);

  readonly status = this.statusState.asReadonly();
  readonly lastCheck = this.lastCheckState.asReadonly();
  readonly isHealthy = computed(() => this.statusState() === 'healthy');
  readonly isDegraded = computed(() => this.statusState() === 'degraded');
  readonly isOffline = computed(() => this.statusState() === 'offline');
  readonly isDisabled = computed(() => this.statusState() === 'disabled');

  constructor() {
    if (this.apiConfig.enabled) {
      // Run initial check
      this.checkHealth();

      // Poll every 30 seconds
      interval(30000).subscribe(() => {
        this.checkHealth();
      });
    }
  }

  private checkHealth(): void {
    if (!this.apiConfig.enabled) {
      this.statusState.set('disabled');
      return;
    }

    this.http
      .get<{ ok: boolean; service: string }>(`${this.apiConfig.baseUrl}/health`)
      .pipe(
        timeout(5000),
        catchError((error) => {
          const status = error?.status;
          if (status === 0 || (status >= 500 && status < 600)) {
            this.statusState.set('offline');
          } else {
            this.statusState.set('degraded');
          }
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result?.ok) {
          this.statusState.set('healthy');
        }
        this.lastCheckState.set(Date.now());
      });
  }
}
