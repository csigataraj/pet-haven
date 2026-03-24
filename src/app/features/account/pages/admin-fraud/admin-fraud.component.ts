import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';

import { AccountLabelsService, FraudActionsService, FraudDisposition } from '../../../../core';
import { EmptyStateComponent, PageHeaderComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-admin-fraud',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    EmptyStateComponent,
    PageHeaderComponent,
    TranslatePipe
  ],
  templateUrl: './admin-fraud.component.html',
  styleUrl: './admin-fraud.component.scss'
})
export class AdminFraudComponent {
  private readonly fraudActions = inject(FraudActionsService);

  readonly blockedPaymentEvents = this.fraudActions.blockedEvents;
  readonly blockedPayments24h = this.fraudActions.blockedCountLast24h;
  readonly openFraudCases = this.fraudActions.openCount;
  readonly escalatedFraudCases = this.fraudActions.escalatedCount;
  readonly allowlistedEmails = this.fraudActions.allowlistedEmails;
  readonly allowlistedFingerprints = this.fraudActions.allowlistedFingerprints;
  readonly dispositionOptions = this.fraudActions.dispositionOptions;
  readonly fraudFilter = signal<'all' | FraudDisposition>('all');
  readonly labels = inject(AccountLabelsService);

  readonly filteredBlockedEvents = computed(() => {
    const filter = this.fraudFilter();
    const events = this.blockedPaymentEvents();
    if (filter === 'all') {
      return events;
    }
    return events.filter((event) => event.disposition === filter);
  });

  reviewFraudEvent(eventId: string): void {
    this.fraudActions.reviewWithPrompt(eventId);
  }

  setFraudFilter(value: string): void {
    if (value === 'all') {
      this.fraudFilter.set('all');
      return;
    }
    this.fraudFilter.set(value as FraudDisposition);
  }

  setFraudDisposition(eventId: string, disposition: FraudDisposition): void {
    this.fraudActions.setDisposition(eventId, disposition);
  }

  setEscalated(eventId: string, escalated: boolean): void {
    this.fraudActions.setEscalated(eventId, escalated);
  }

  allowlistEventEmail(email: string): void {
    this.fraudActions.allowlistEmail(email);
  }

  allowlistEventFingerprint(fingerprint: string): void {
    this.fraudActions.allowlistFingerprint(fingerprint);
  }

  unlockEventVelocity(email: string, fingerprint: string): void {
    this.fraudActions.unlockVelocity(email, fingerprint);
  }
}
