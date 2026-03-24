import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink, LanguageSwitcherComponent, TranslatePipe],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() backLabel = 'navigation.backToCatalog';
  @Input() backLink = '/';
}
