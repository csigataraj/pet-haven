import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatbotResponse {
  reply: string;
  conversationHistory: ChatMessage[];
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/chatbot';

  sendMessage(message: string, conversationHistory: ChatMessage[]): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/message`, {
      message,
      conversationHistory
    });
  }
}
