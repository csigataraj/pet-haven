import { Injectable, Injector, computed, inject, signal } from '@angular/core';

import { createPrefixedId } from '../../utils/id';
import { runBackendEffect } from '../../utils/backend-sync';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { AuditLogService } from '../audit-log/audit-log.service';
import { API_CONFIG } from '../../api/api-config.token';
import { FraudApiService } from '../../api/fraud-api.service';

export interface CardPaymentInput {
  customerEmail: string;
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  currencyCode: string;
}

export interface PaymentResult {
  ok: boolean;
  authCode?: string;
  last4?: string;
  cardFingerprint?: string;
  message?: string;
}

export interface FraudBlockedEvent {
  id: string;
  timestamp: number;
  email: string;
  fingerprint: string;
  reason: string;
  note: string;
  reviewed: boolean;
  disposition: FraudDisposition;
  escalated: boolean;
}

export type FraudDisposition =
  | 'open'
  | 'false-positive'
  | 'card-testing'
  | 'account-takeover'
  | 'friendly-fraud'
  | 'closed';

interface FraudStore {
  emailVelocity: Record<string, number[]>;
  fingerprintVelocity: Record<string, number[]>;
  allowlistedEmails: string[];
  allowlistedFingerprints: string[];
  blockedEvents: FraudBlockedEvent[];
}

const STORAGE_KEY = 'pet1.paymentFraud';
const FRAUD_WINDOW_MS = 10 * 60 * 1000;
const MAX_TX_PER_WINDOW = 3;

const EMPTY_FRAUD_STORE: FraudStore = {
  emailVelocity: {},
  fingerprintVelocity: {},
  allowlistedEmails: [],
  allowlistedFingerprints: [],
  blockedEvents: []
};

function createAuthCode(): string {
  return createPrefixedId('AUTH', 6);
}

function createEventId(): string {
  return createPrefixedId('FR', 5);
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly auditLogService = inject(AuditLogService);
  private readonly injector = inject(Injector);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly fraudState = signal<FraudStore>(this.readStore());

  readonly blockedEvents = computed(() =>
    [...this.fraudState().blockedEvents].sort((a, b) => b.timestamp - a.timestamp)
  );

  readonly blockedCountLast24h = computed(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return this.fraudState().blockedEvents.filter((event) => event.timestamp >= cutoff).length;
  });

  readonly allowlistedEmails = computed(() => this.fraudState().allowlistedEmails);
  readonly allowlistedFingerprints = computed(() => this.fraudState().allowlistedFingerprints);
  readonly escalatedCount = computed(() => this.fraudState().blockedEvents.filter((event) => event.escalated).length);
  readonly openCount = computed(() => this.fraudState().blockedEvents.filter((event) => event.disposition === 'open').length);

  authorizeCard(input: CardPaymentInput): PaymentResult {
    const now = Date.now();
    const normalizedNumber = input.cardNumber.replace(/\s+/g, '');
    const last4 = normalizedNumber.slice(-4);
    const emailKey = input.customerEmail.trim().toLowerCase();
    const fingerprint = `${last4}:${input.expiry.trim()}:${input.cardHolder.trim().toLowerCase()}`;

    if (this.isAllowlisted(emailKey, fingerprint)) {
      this.recordSuccessfulAttempt(emailKey, fingerprint, now);
      return {
        ok: true,
        authCode: createAuthCode(),
        last4,
        cardFingerprint: fingerprint
      };
    }

    if (this.exceedsVelocity(emailKey, fingerprint, now)) {
      this.recordBlockedEvent(emailKey, fingerprint, 'Velocity limit exceeded', now);
      return {
        ok: false,
        message: 'Payment blocked for security reasons. Please wait a few minutes and try again.'
      };
    }

    // Deterministic demo decline pattern so behavior is testable.
    if (last4 === '0000') {
      return {
        ok: false,
        message: 'Card was declined by issuer. Try a different payment method.'
      };
    }

    this.recordSuccessfulAttempt(emailKey, fingerprint, now);

    return {
      ok: true,
      authCode: createAuthCode(),
      last4,
      cardFingerprint: fingerprint
    };
  }

  allowlistEmail(email: string): void {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      return;
    }
    const store = this.fraudState();
    if (store.allowlistedEmails.includes(normalized)) {
      return;
    }
    this.fraudState.set({
      ...store,
      allowlistedEmails: [...store.allowlistedEmails, normalized]
    });
    this.writeStore(this.fraudState());
    this.auditLogService.log('fraud', 'allowlist-email', normalized, 'Email added to allowlist');

    runBackendEffect(this.apiConfig.enabled, this.fraudApi?.allowlistEmail(normalized), void 0);
  }

  allowlistFingerprint(fingerprint: string): void {
    const normalized = fingerprint.trim().toLowerCase();
    if (!normalized) {
      return;
    }
    const store = this.fraudState();
    if (store.allowlistedFingerprints.includes(normalized)) {
      return;
    }
    this.fraudState.set({
      ...store,
      allowlistedFingerprints: [...store.allowlistedFingerprints, normalized]
    });
    this.writeStore(this.fraudState());
    this.auditLogService.log('fraud', 'allowlist-fingerprint', normalized, 'Fingerprint added to allowlist');

    runBackendEffect(this.apiConfig.enabled, this.fraudApi?.allowlistFingerprint(normalized), void 0);
  }

  clearVelocity(email: string, fingerprint: string): void {
    const emailKey = email.trim().toLowerCase();
    const fp = fingerprint.trim().toLowerCase();
    const store = this.fraudState();

    const nextEmailVelocity = { ...store.emailVelocity };
    const nextFingerprintVelocity = { ...store.fingerprintVelocity };
    delete nextEmailVelocity[emailKey];
    delete nextFingerprintVelocity[fp];

    this.fraudState.set({
      ...store,
      emailVelocity: nextEmailVelocity,
      fingerprintVelocity: nextFingerprintVelocity
    });
    this.writeStore(this.fraudState());
    this.auditLogService.log('fraud', 'clear-velocity', emailKey, `Velocity reset for ${fp}`);

    runBackendEffect(this.apiConfig.enabled, this.fraudApi?.unlockVelocity(emailKey, fp), void 0);
  }

  reviewBlockedEvent(eventId: string, note: string): void {
    const normalized = note.trim();
    this.fraudState.update((store) => ({
      ...store,
      blockedEvents: store.blockedEvents.map((event) =>
        event.id === eventId
          ? { ...event, reviewed: true, note: normalized }
          : event
      )
    }));
    this.writeStore(this.fraudState());
    this.auditLogService.log('fraud', 'review-case', eventId, normalized || 'Case reviewed');

    runBackendEffect(this.apiConfig.enabled, this.fraudApi?.reviewBlockedEvent(eventId, normalized), void 0);
  }

  setDisposition(eventId: string, disposition: FraudDisposition): void {
    this.fraudState.update((store) => ({
      ...store,
      blockedEvents: store.blockedEvents.map((event) =>
        event.id === eventId
          ? { ...event, disposition }
          : event
      )
    }));
    this.writeStore(this.fraudState());
    this.auditLogService.log('fraud', 'set-disposition', eventId, disposition);

    runBackendEffect(this.apiConfig.enabled, this.fraudApi?.setDisposition(eventId, disposition), void 0);
  }

  setEscalated(eventId: string, escalated: boolean): void {
    this.fraudState.update((store) => ({
      ...store,
      blockedEvents: store.blockedEvents.map((event) =>
        event.id === eventId
          ? { ...event, escalated }
          : event
      )
    }));
    this.writeStore(this.fraudState());
    this.auditLogService.log('fraud', escalated ? 'escalate-case' : 'deescalate-case', eventId, escalated ? 'Escalated' : 'De-escalated');

    runBackendEffect(this.apiConfig.enabled, this.fraudApi?.setEscalated(eventId, escalated), void 0);
  }

  private isAllowlisted(email: string, fingerprint: string): boolean {
    const store = this.fraudState();
    return (
      store.allowlistedEmails.includes(email) ||
      store.allowlistedFingerprints.includes(fingerprint.toLowerCase())
    );
  }

  private exceedsVelocity(emailKey: string, fingerprint: string, now: number): boolean {
    const store = this.fraudState();
    const emailHistory = (store.emailVelocity[emailKey] ?? []).filter((value) => now - value < FRAUD_WINDOW_MS);
    const cardHistory = (store.fingerprintVelocity[fingerprint] ?? []).filter((value) => now - value < FRAUD_WINDOW_MS);

    this.fraudState.set({
      ...store,
      emailVelocity: {
        ...store.emailVelocity,
        [emailKey]: emailHistory
      },
      fingerprintVelocity: {
        ...store.fingerprintVelocity,
        [fingerprint]: cardHistory
      }
    });
    this.writeStore(this.fraudState());

    return emailHistory.length >= MAX_TX_PER_WINDOW || cardHistory.length >= MAX_TX_PER_WINDOW;
  }

  private recordSuccessfulAttempt(emailKey: string, fingerprint: string, now: number): void {
    const store = this.fraudState();

    const emailHistory = (store.emailVelocity[emailKey] ?? []).filter((value) => now - value < FRAUD_WINDOW_MS);
    const cardHistory = (store.fingerprintVelocity[fingerprint] ?? []).filter((value) => now - value < FRAUD_WINDOW_MS);

    this.fraudState.set({
      ...store,
      emailVelocity: {
        ...store.emailVelocity,
        [emailKey]: [...emailHistory, now]
      },
      fingerprintVelocity: {
        ...store.fingerprintVelocity,
        [fingerprint]: [...cardHistory, now]
      }
    });
    this.writeStore(this.fraudState());
  }

  private recordBlockedEvent(email: string, fingerprint: string, reason: string, timestamp: number): void {
    const store = this.fraudState();
    const next: FraudBlockedEvent[] = [
      {
        id: createEventId(),
        timestamp,
        email,
        fingerprint,
        reason,
        note: '',
        reviewed: false,
        disposition: 'open' as FraudDisposition,
        escalated: false
      },
      ...store.blockedEvents
    ].slice(0, 50);

    this.fraudState.set({
      ...store,
      blockedEvents: next
    });
    this.writeStore(this.fraudState());
    this.auditLogService.log('fraud', 'blocked-attempt', next[0].id, `${email} - ${reason}`, 'system');
  }

  private readStore(): FraudStore {
    const parsed = loadFromStorage<FraudStore | null>(STORAGE_KEY, EMPTY_FRAUD_STORE);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return EMPTY_FRAUD_STORE;
    }

    return {
      emailVelocity: parsed.emailVelocity ?? {},
      fingerprintVelocity: parsed.fingerprintVelocity ?? {},
      allowlistedEmails: parsed.allowlistedEmails ?? [],
      allowlistedFingerprints: parsed.allowlistedFingerprints ?? [],
      blockedEvents: parsed.blockedEvents?.map((event) => ({
        id: event.id ?? createEventId(),
        timestamp: event.timestamp,
        email: event.email,
        fingerprint: event.fingerprint,
        reason: event.reason,
        note: event.note ?? '',
        reviewed: event.reviewed ?? false,
        disposition: event.disposition ?? 'open',
        escalated: event.escalated ?? false
      })) ?? []
    };
  }

  private writeStore(store: FraudStore): void {
    saveToStorage(STORAGE_KEY, store);
  }

  private get fraudApi(): FraudApiService | null {
    return this.injector.get(FraudApiService, null);
  }
}
