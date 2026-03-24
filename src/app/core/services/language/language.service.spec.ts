import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [LanguageService] });
    service = TestBed.inject(LanguageService);
  });

  it('defaults to English and exposes current language metadata', () => {
    expect(service.currentLang()).toBe('en');
    expect(service.currentLanguage.code).toBe('en');
  });

  it('updates language and persists selection', () => {
    service.setLanguage('fr');
    expect(service.currentLang()).toBe('fr');
    expect(localStorage.getItem('pet1.locale')).toBe('fr');
  });
});
