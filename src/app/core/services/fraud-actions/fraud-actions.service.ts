import { Injectable, inject } from '@angular/core';

import { FraudDisposition, PaymentService } from '../payment/payment.service';
import { TranslateService } from '../translate/translate.service';

export const FRAUD_DISPOSITION_OPTIONS: { value: FraudDisposition; labelKey: string }[] = [
  { value: 'open', labelKey: 'account.fraudCase.open' },
  { value: 'false-positive', labelKey: 'account.fraudCase.falsePositive' },
  { value: 'card-testing', labelKey: 'account.fraudCase.cardTesting' },
  { value: 'account-takeover', labelKey: 'account.fraudCase.accountTakeover' },
  { value: 'friendly-fraud', labelKey: 'account.fraudCase.friendlyFraud' },
  { value: 'closed', labelKey: 'account.fraudCase.closed' }
];

@Injectable({ providedIn: 'root' })
export class FraudActionsService {
  private readonly paymentService = inject(PaymentService);
  private readonly translateService = inject(TranslateService);

  readonly blockedEvents = this.paymentService.blockedEvents;
  readonly blockedCountLast24h = this.paymentService.blockedCountLast24h;
  readonly openCount = this.paymentService.openCount;
  readonly escalatedCount = this.paymentService.escalatedCount;
  readonly allowlistedEmails = this.paymentService.allowlistedEmails;
  readonly allowlistedFingerprints = this.paymentService.allowlistedFingerprints;
  readonly dispositionOptions = FRAUD_DISPOSITION_OPTIONS;

  reviewWithPrompt(eventId: string): void {
    const note = window.prompt(
      this.translateService.t('account.admin.fraudReviewPrompt.message'),
      this.translateService.t('account.admin.fraudReviewPrompt.defaultNote')
    );
    if (note === null) {
      return;
    }

    this.review(eventId, note);
  }

  review(eventId: string, note: string): void {
    this.paymentService.reviewBlockedEvent(
      eventId,
      note || this.translateService.t('account.fraudCase.reviewDefaultNote')
    );
  }

  setDisposition(eventId: string, disposition: FraudDisposition): void {
    this.paymentService.setDisposition(eventId, disposition);
  }

  setEscalated(eventId: string, escalated: boolean): void {
    this.paymentService.setEscalated(eventId, escalated);
  }

  allowlistEmail(email: string): void {
    this.paymentService.allowlistEmail(email);
  }

  allowlistFingerprint(fingerprint: string): void {
    this.paymentService.allowlistFingerprint(fingerprint);
  }

  unlockVelocity(email: string, fingerprint: string): void {
    this.paymentService.clearVelocity(email, fingerprint);
  }
}
