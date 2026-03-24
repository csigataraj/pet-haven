import {
  Component,
  computed,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { LanguageService } from '../../../core';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss'
})
export class LanguageSwitcherComponent {
  private readonly languageService = inject(LanguageService);
  readonly languages = this.languageService.languages;
  readonly currentLang = this.languageService.currentLang;

  readonly currentLanguage = computed(() => {
    return this.languageService.languages.find((l) => l.code === this.currentLang()) ?? this.languageService.languages[0];
  });

  selectLanguage(code: string): void {
    this.languageService.setLanguage(code);
  }
}
