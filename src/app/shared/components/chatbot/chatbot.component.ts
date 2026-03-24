import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ChatbotService, ChatMessage } from '../../../core';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    TranslatePipe
  ],
  styleUrl: './chatbot.component.scss',
  template: `
    <button
      type="button"
      class="chatbot-trigger"
      (click)="toggleChat()"
      [attr.aria-label]="'common.chatbot' | translate"
      [attr.aria-expanded]="isOpen()"
    >
      @if (isOpen()) {
        <mat-icon aria-hidden="true">close</mat-icon>
      } @else {
        <mat-icon aria-hidden="true">chat_bubble</mat-icon>
      }
    </button>

    @if (isOpen()) {
      <section class="chatbot-window" [attr.aria-label]="'common.chatbot' | translate">
        <div class="chat-header">
          <h3>{{ 'common.chatbot' | translate }}</h3>
          <button
            type="button"
            class="chat-close"
            (click)="toggleChat()"
            [attr.aria-label]="'navigation.close' | translate"
          >
            <span aria-hidden="true">x</span>
          </button>
        </div>

        <div class="chat-messages">
          @if (messages().length === 0) {
            <div class="welcome-message">
              <p>{{ 'chatbot.welcome' | translate }}</p>
            </div>
          }
          @for (msg of messages(); track $index) {
            <div [class]="'chat-message ' + msg.role">
              <div class="message-content">{{ msg.content }}</div>
              @if (msg.timestamp) {
                <div class="message-time">{{ msg.timestamp | date:'short' }}</div>
              }
            </div>
          }
          @if (isLoading()) {
            <div class="chat-message assistant loading">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
            </div>
          }
        </div>

        <div class="chat-input-area">
          <form (ngSubmit)="sendMessage()" class="chat-form">
            <input
              class="chat-input"
              type="text"
              [(ngModel)]="inputMessage"
              name="message"
              [placeholder]="'chatbot.placeholder' | translate"
              [disabled]="isLoading()"
            />
            <button class="chat-send" type="submit" [disabled]="isLoading() || !inputMessage.trim()">
              <span aria-hidden="true">&#10148;</span>
            </button>
          </form>
        </div>
      </section>
    }
  `
})
export class ChatbotComponent {
  private readonly chatbotService = inject(ChatbotService);

  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  inputMessage = '';

  toggleChat(): void {
    this.isOpen.update((opened) => !opened);
  }

  sendMessage(): void {
    if (!this.inputMessage.trim() || this.isLoading()) {
      return;
    }

    const userMessage = this.inputMessage.trim();
    this.inputMessage = '';

    const currentMessages = this.messages();
    this.messages.set([
      ...currentMessages,
      { role: 'user', content: userMessage, timestamp: new Date() }
    ]);

    this.isLoading.set(true);

    this.chatbotService.sendMessage(userMessage, currentMessages).subscribe({
      next: (response) => {
        this.messages.set(response.conversationHistory.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        })));
        this.isLoading.set(false);
      },
      error: () => {
        this.messages.set([
          ...this.messages(),
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again later.',
            timestamp: new Date()
          }
        ]);
        this.isLoading.set(false);
      }
    });
  }
}
