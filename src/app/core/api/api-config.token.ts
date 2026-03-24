import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  enabled: boolean;
  baseUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  factory: () => ({
    enabled: false,
    baseUrl: '/api'
  })
});
