import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LanguageService } from '../language/language.service';
import { TranslateService } from './translate.service';

class MockLanguageService {
  private readonly lang = signal('en');

  readonly languages = [
    { code: 'en', label: 'English', flag: 'UK' },
    { code: 'fr', label: 'Francais', flag: 'FR' }
  ];
  readonly currentLang = this.lang.asReadonly();

  setLanguage(code: string): void {
    this.lang.set(code);
  }
}

describe('TranslateService', () => {
  let service: TranslateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TranslateService, { provide: LanguageService, useClass: MockLanguageService }]
    });

    service = TestBed.inject(TranslateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads translations and interpolates params', () => {
    const enRequests = httpMock.match((req) => req.url.includes('/i18n/en.json'));
    const frRequests = httpMock.match((req) => req.url.includes('/i18n/fr.json'));

    expect(enRequests.length).toBeGreaterThan(0);
    expect(frRequests.length).toBeGreaterThan(0);

    enRequests.forEach((req) => req.flush({ greeting: 'Hello {name}' }));
    frRequests.forEach((req) => req.flush({ greeting: 'Bonjour {name}' }));

    expect(service.t('greeting', { name: 'Casey' })).toBe('Hello Casey');
    expect(service.t('unknown.key')).toBe('unknown.key');
  });
});
