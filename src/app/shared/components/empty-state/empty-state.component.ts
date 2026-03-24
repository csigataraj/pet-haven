import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input({ required: true }) titleKey = '';
  @Input({ required: true }) messageKey = '';
  @Input() titleParams?: Record<string, string | number>;
  @Input() messageParams?: Record<string, string | number>;
  @Input() actionLabelKey = '';
  @Input() actionLink = '';
  @Input() ariaLabelKey = '';
}
