import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { FraudActionsService, FraudDisposition } from '../../../../core';
import { EmptyStateComponent, PageHeaderComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-fraud-case',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
    EmptyStateComponent,
    TranslatePipe
  ],
  templateUrl: './fraud-case.component.html',
  styleUrl: './fraud-case.component.scss'
})
export class FraudCaseComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fraudActions = inject(FraudActionsService);
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap
  });

  readonly blockedEvents = this.fraudActions.blockedEvents;
  readonly dispositionOptions = this.fraudActions.dispositionOptions;
  readonly caseId = computed(() => this.paramMap().get('id') ?? '');

  readonly event = computed(() =>
    this.blockedEvents().find((entry) => entry.id === this.caseId()) ?? null
  );

  reviewCase(caseId: string, noteValue: string): void {
    this.fraudActions.review(caseId, noteValue);
  }

  setDisposition(caseId: string, disposition: FraudDisposition): void {
    this.fraudActions.setDisposition(caseId, disposition);
  }

  setEscalated(caseId: string, escalated: boolean): void {
    this.fraudActions.setEscalated(caseId, escalated);
  }

  allowlistEmail(email: string): void {
    this.fraudActions.allowlistEmail(email);
  }

  allowlistFingerprint(fingerprint: string): void {
    this.fraudActions.allowlistFingerprint(fingerprint);
  }

  unlockVelocity(email: string, fingerprint: string): void {
    this.fraudActions.unlockVelocity(email, fingerprint);
  }
}
