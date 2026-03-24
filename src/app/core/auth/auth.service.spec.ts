import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AuthService] });
    service = TestBed.inject(AuthService);
  });

  it('logs in with demo credentials', () => {
    const ok = service.login('admin@pethaven.com', 'pet1234');
    expect(ok).toBeTrue();
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()?.email).toBe('admin@pethaven.com');
  });

  it('returns false on invalid login', () => {
    const ok = service.login('admin@pethaven.com', 'wrong');
    expect(ok).toBeFalse();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('registers a new user and prevents duplicate registration', () => {
    const first = service.register('Casey', 'casey@example.com', 'secret123');
    const second = service.register('Casey', 'casey@example.com', 'secret123');

    expect(first).toBeNull();
    expect(second).toBe('An account with that email already exists.');
    expect(service.currentUser()?.email).toBe('casey@example.com');
  });
});
