import { Injectable, inject, signal } from '@angular/core';

import { createPrefixedId } from '../../utils/id';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { TranslateService } from '../translate/translate.service';

export type NotificationType = 'order-confirmation' | 'welcome' | 'account-created';

export interface EmailNotification {
  id: string;
  type: NotificationType;
  to: string;
  subject: string;
  preview: string;
  createdAt: string;
}

const STORAGE_KEY = 'pet1.notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly translateService = inject(TranslateService);
  private readonly state = signal<EmailNotification[]>(this.load());

  readonly notifications = this.state.asReadonly();

  push(notification: Omit<EmailNotification, 'id' | 'createdAt'>): void {
    const next: EmailNotification = {
      id: createPrefixedId('NT', 5),
      createdAt: new Date().toISOString(),
      ...notification
    };

    this.state.update((current) => [next, ...current]);
    this.persist();
  }

  pushOrderConfirmation(to: string, orderId: string): void {
    this.push({
      type: 'order-confirmation',
      to,
      subject: this.translateService.t('account.notifications.subject.orderConfirmation', { orderId }),
      preview: this.translateService.t('account.notifications.preview.orderConfirmation', { orderId })
    });
  }

  pushWelcome(to: string, name: string): void {
    this.push({
      type: 'welcome',
      to,
      subject: this.translateService.t('account.notifications.subject.welcome', { name }),
      preview: this.translateService.t('account.notifications.preview.welcome')
    });
  }

  clear(): void {
    this.state.set([]);
    this.persist();
  }

  private load(): EmailNotification[] {
    return loadFromStorage<EmailNotification[]>(STORAGE_KEY, []);
  }

  private persist(): void {
    saveToStorage(STORAGE_KEY, this.state());
  }
}
