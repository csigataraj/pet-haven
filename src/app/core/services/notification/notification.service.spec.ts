import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TranslateService } from '../translate/translate.service';
import { NotificationService } from './notification.service';

const NOTIF_TRANSLATIONS: Record<string, string> = {
  'account.notifications.subject.welcome': 'Welcome to Pet Haven, {name}',
  'account.notifications.subject.orderConfirmation': 'Order {orderId} confirmed',
  'account.notifications.preview.welcome': 'Welcome to Pet Haven',
  'account.notifications.preview.orderConfirmation': 'Your order {orderId} has been confirmed'
};

const translateMock = {
  translations: signal(NOTIF_TRANSLATIONS),
  t(key: string, params?: Record<string, string | number>): string {
    let value = NOTIF_TRANSLATIONS[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replaceAll(`{${k}}`, String(v));
      }
    }
    return value;
  }
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: TranslateService, useValue: translateMock }
      ]
    });
    service = TestBed.inject(NotificationService);
  });

  it('pushes typed notifications', () => {
    service.pushOrderConfirmation('casey@example.com', 'PH-1001');
    service.pushWelcome('casey@example.com', 'Casey');

    const notes = service.notifications();
    expect(notes.length).toBe(2);
    expect(notes[0].type).toBe('welcome');
    expect(notes[0].subject).toContain('Casey');
    expect(notes[1].type).toBe('order-confirmation');
    expect(notes[1].subject).toContain('PH-1001');
  });

  it('clears all notifications', () => {
    service.pushWelcome('x@example.com', 'X');
    service.clear();
    expect(service.notifications()).toEqual([]);
  });
});
