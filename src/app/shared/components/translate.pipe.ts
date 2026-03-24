import { Pipe, PipeTransform, inject } from '@angular/core';

import { TranslateService } from '../../core';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly ts = inject(TranslateService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.ts.t(key, params);
  }
}
