import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, take, tap } from 'rxjs';

import { LanguageService } from '../language/language.service';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly http = inject(HttpClient);
  private readonly langService = inject(LanguageService);
  private readonly cache = new Map<string, Record<string, string>>();

  readonly translations = signal<Record<string, string>>({});

  constructor() {
    // Pre-fetch all supported languages so switching is instant
    for (const lang of this.langService.languages) {
      this.fetchLang(lang.code);
    }

    // React to language changes (also runs immediately for the initial language)
    effect(() => {
      const code = this.langService.currentLang();
      const cached = this.cache.get(code);
      if (cached) {
        this.translations.set(cached);
      } else {
        this.fetchLang(code, true);
      }
    });
  }

  t(key: string, params?: Record<string, string | number>): string {
    let value = this.translations()[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replaceAll(`{${k}}`, String(v));
      }
    }
    return value;
  }

  private fetchLang(code: string, setActive = false): void {
    this.http
      .get<Record<string, string>>(`assets/i18n/${code}.json`)
      .pipe(
        take(1),
        // Fallback to absolute URL for environments that rewrite relative assets.
        catchError(() => this.http.get<Record<string, string>>(`/assets/i18n/${code}.json`).pipe(take(1))),
        catchError(() => of(this.cache.get(code) ?? {})),
        tap((t) => {
          this.cache.set(code, t);
          if (setActive || this.langService.currentLang() === code) {
            this.translations.set(t);
          }
        })
      )
      .subscribe();
  }
}
