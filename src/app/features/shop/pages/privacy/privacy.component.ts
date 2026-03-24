import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageHeaderComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink, PageHeaderComponent, TranslatePipe],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {}
