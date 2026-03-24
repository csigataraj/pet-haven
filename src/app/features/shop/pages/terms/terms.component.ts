import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageHeaderComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, PageHeaderComponent, TranslatePipe],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {}
