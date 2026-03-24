import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PlaceOrderInput, PlacedOrder, OrderStatus, ReturnEventCode } from '../services/order/order.service';
import { API_CONFIG } from './api-config.token';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  placeOrder(input: PlaceOrderInput): Observable<PlacedOrder> {
    return this.http.post<PlacedOrder>(`${this.apiConfig.baseUrl}/orders`, input);
  }

  listOrdersForEmail(email: string): Observable<PlacedOrder[]> {
    return this.http.get<PlacedOrder[]>(`${this.apiConfig.baseUrl}/orders`, {
      params: { email }
    });
  }

  updateStatus(orderId: string, status: OrderStatus): Observable<void> {
    return this.http.patch<void>(`${this.apiConfig.baseUrl}/orders/${orderId}/status`, { status });
  }

  cancelOrder(orderId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiConfig.baseUrl}/orders/${orderId}/cancel`, {});
  }

  requestReturn(orderId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiConfig.baseUrl}/orders/${orderId}/returns/request`, { reason });
  }

  approveReturn(orderId: string): Observable<void> {
    return this.http.post<void>(`${this.apiConfig.baseUrl}/orders/${orderId}/returns/approve`, {});
  }

  markReturnEvent(orderId: string, eventCode: ReturnEventCode, note: string): Observable<void> {
    return this.http.post<void>(`${this.apiConfig.baseUrl}/orders/${orderId}/returns/events`, { eventCode, note });
  }
}
