import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-price',
  imports: [CurrencyPipe],
  template: `{{ value | currency:currencyCode:'symbol':'1.2-2' }}`
})
export class PriceComponent {
  @Input({ required: true }) value = 0;
  @Input() currencyCode = 'USD';
}
