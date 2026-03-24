import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AccountLabelsService, AccountOrdersService } from '../../../../core';
import { EmptyStateComponent, PageHeaderComponent, PriceComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-returns',
  imports: [RouterLink, EmptyStateComponent, PageHeaderComponent, PriceComponent, TranslatePipe],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.scss'
})
export class ReturnsComponent {
  private readonly accountOrders = inject(AccountOrdersService);

  readonly currentUser = this.accountOrders.currentUser;
  readonly returnedOrders = this.accountOrders.returnedOrders;
  readonly labels = inject(AccountLabelsService);
}
