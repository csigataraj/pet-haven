import { Injectable, signal } from '@angular/core';

import { loadTextFromStorage, saveTextToStorage } from '../../utils/storage';

export interface Language {
  code: string;
  labelKey: string;
  label: string;
  flag: string;
  flagIcon?: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', labelKey: 'navigation.languages.en', label: 'English', flag: '🇬🇧', flagIcon: 'assets/flags/gb.svg' },
  { code: 'fr', labelKey: 'navigation.languages.fr', label: 'Français', flag: '🇫🇷', flagIcon: 'assets/flags/fr.svg' },
  { code: 'hu', labelKey: 'navigation.languages.hu', label: 'Magyar', flag: '🇭🇺', flagIcon: 'assets/flags/hu.svg' }
];

const STORAGE_KEY = 'pet1.locale';

function readStoredLocale(): string {
  return loadTextFromStorage(STORAGE_KEY, 'en');
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _current = signal<string>(readStoredLocale());

  readonly currentLang = this._current.asReadonly();
  readonly languages = SUPPORTED_LANGUAGES;

  get currentLanguage(): Language {
    return SUPPORTED_LANGUAGES.find((l) => l.code === this._current()) ?? SUPPORTED_LANGUAGES[0];
  }

  setLanguage(code: string): void {
    this._current.set(code);
    saveTextToStorage(STORAGE_KEY, code);
  }
}
