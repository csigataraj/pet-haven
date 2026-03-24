import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  email: string;
  name: string;
}

// Demo credentials — replace with a real backend call in production.
const DEMO_CREDENTIALS: Record<string, { password: string; name: string }> = {
  'admin@pethaven.com': { password: 'pet1234', name: 'Admin User' },
  'staff@pethaven.com': { password: 'staff123', name: 'Staff Member' }
};

// In-memory registered users (persists for the session only).
const registeredUsers: Record<string, { password: string; name: string }> = {
  ...DEMO_CREDENTIALS
};

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const BLOCK_WINDOW_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user = signal<AuthUser | null>(null);
  private readonly failedLogins: Record<string, number> = {};
  private readonly blockedUntil: Record<string, number> = {};

  readonly currentUser = this.user.asReadonly();
  readonly isAuthenticated = computed(() => this.user() !== null);

  login(email: string, password: string): boolean {
    const normalised = email.toLowerCase().trim();
    const now = Date.now();

    if (this.blockedUntil[normalised] && this.blockedUntil[normalised] > now) {
      return false;
    }

    const entry = registeredUsers[normalised];
    if (!entry || entry.password !== password) {
      this.failedLogins[normalised] = (this.failedLogins[normalised] ?? 0) + 1;
      if (this.failedLogins[normalised] >= MAX_FAILED_LOGIN_ATTEMPTS) {
        this.blockedUntil[normalised] = now + BLOCK_WINDOW_MS;
        this.failedLogins[normalised] = 0;
      }
      return false;
    }

    this.failedLogins[normalised] = 0;
    this.blockedUntil[normalised] = 0;
    this.user.set({ email: normalised, name: entry.name });
    return true;
  }

  loginErrorMessage(email: string): string {
    const normalised = email.toLowerCase().trim();
    const blocked = this.blockedUntil[normalised] ?? 0;
    const now = Date.now();
    if (blocked > now) {
      const remainingMinutes = Math.ceil((blocked - now) / 60000);
      return `Too many login attempts. Try again in ${remainingMinutes} minute(s).`;
    }
    return 'Invalid email or password.';
  }

  /** Returns null on success, or an error string on failure. */
  register(name: string, email: string, password: string): string | null {
    const normalised = email.toLowerCase().trim();
    if (registeredUsers[normalised]) {
      return 'An account with that email already exists.';
    }
    registeredUsers[normalised] = { password, name: name.trim() };
    this.user.set({ email: normalised, name: name.trim() });
    return null;
  }

  logout(): void {
    this.user.set(null);
  }
}
