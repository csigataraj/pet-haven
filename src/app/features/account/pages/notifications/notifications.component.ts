import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { AccountLabelsService, NotificationService } from '../../../../core';
import { EmptyStateComponent, PageHeaderComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe, MatButtonModule, PageHeaderComponent, EmptyStateComponent, TranslatePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = this.notificationService.notifications;
  readonly labels = inject(AccountLabelsService);

  clearAll(): void {
    this.notificationService.clear();
  }
}
