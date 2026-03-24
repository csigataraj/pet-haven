import { Injectable, Injector, computed, inject, signal } from '@angular/core';

import { createPrefixedId } from '../../utils/id';
import { runBackendEffect, runBackendSubscription } from '../../utils/backend-sync';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { AuthService } from '../../auth';
import { API_CONFIG } from '../../api/api-config.token';
import { AuditApiService } from '../../api/audit-api.service';

export type AuditArea = 'fraud' | 'returns' | 'orders' | 'inventory';

export interface AuditEntry {
  id: string;
  timestamp: number;
  actor: string;
  area: AuditArea;
  action: string;
  targetId: string;
  details: string;
  prevHash: string;
  hash: string;
}

const STORAGE_KEY = 'pet1.auditLog';

function createHash(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(index);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function canonicalPayload(entry: Omit<AuditEntry, 'hash'>): string {
  return [
    entry.id,
    String(entry.timestamp),
    entry.actor,
    entry.area,
    entry.action,
    entry.targetId,
    entry.details,
    entry.prevHash
  ].join('|');
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly authService = inject(AuthService);
  private readonly injector = inject(Injector);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly entriesState = signal<AuditEntry[]>(this.readEntries());

  readonly entries = computed(() =>
    [...this.entriesState()].sort((a, b) => b.timestamp - a.timestamp)
  );
  readonly chainValid = computed(() => this.validateChain(this.entriesState()));

  constructor() {
    this.syncFromBackend();
  }

  toCsv(entries: AuditEntry[]): string {
    const header = ['id', 'timestamp', 'actor', 'area', 'action', 'targetId', 'details', 'prevHash', 'hash'];
    const rows = entries.map((entry) => [
      entry.id,
      new Date(entry.timestamp).toISOString(),
      entry.actor,
      entry.area,
      entry.action,
      entry.targetId,
      entry.details,
      entry.prevHash,
      entry.hash
    ]);

    return [header, ...rows]
      .map((row) => row.map((value) => this.escapeCsv(String(value))).join(','))
      .join('\n');
  }

  log(area: AuditArea, action: string, targetId: string, details: string, actor?: string): void {
    const previous = this.entriesState()[0];
    const resolvedActor = this.resolveActor(actor);
    const nextEntry: Omit<AuditEntry, 'hash'> = {
      id: createPrefixedId('AL', 6),
      timestamp: Date.now(),
      actor: resolvedActor,
      area,
      action: action.trim(),
      targetId: targetId.trim(),
      details: details.trim(),
      prevHash: previous?.hash ?? ''
    };

    const next: AuditEntry[] = [
      {
        ...nextEntry,
        hash: createHash(canonicalPayload(nextEntry))
      },
      ...this.entriesState()
    ].slice(0, 250);

    this.entriesState.set(next);
    this.persistEntries();

    runBackendEffect(this.apiConfig.enabled, this.auditApi?.saveEntry(next[0]), void 0);
  }

  private readEntries(): AuditEntry[] {
    const parsed = loadFromStorage<AuditEntry[]>(STORAGE_KEY, []);
    const cast = parsed
      .filter((entry) =>
        !!entry?.id &&
        typeof entry.timestamp === 'number' &&
        !!entry.area &&
        !!entry.action
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    const hasExistingHashes = cast.every(
      (entry) => typeof entry.hash === 'string' && typeof entry.prevHash === 'string'
    );

    if (hasExistingHashes) {
      return cast.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        actor: entry.actor || 'admin',
        area: entry.area,
        action: entry.action,
        targetId: entry.targetId || '',
        details: entry.details || '',
        prevHash: entry.prevHash,
        hash: entry.hash
      }));
    }

    const next: AuditEntry[] = [];
    let previousHash = '';
    for (let index = cast.length - 1; index >= 0; index -= 1) {
      const entry = cast[index];
      const normalized: Omit<AuditEntry, 'hash'> = {
        id: entry.id,
        timestamp: entry.timestamp,
        actor: entry.actor || 'admin',
        area: entry.area,
        action: entry.action,
        targetId: entry.targetId || '',
        details: entry.details || '',
        prevHash: previousHash
      };
      const withHash: AuditEntry = {
        ...normalized,
        hash: createHash(canonicalPayload(normalized))
      };
      previousHash = withHash.hash;
      next.unshift(withHash);
    }
    return next;
  }

  private resolveActor(actor?: string): string {
    if (actor && actor.trim()) {
      return actor.trim();
    }

    const user = this.authService.currentUser();
    if (user) {
      return `${user.name} <${user.email}>`;
    }

    return 'admin';
  }

  private validateChain(entries: AuditEntry[]): boolean {
    for (let index = 0; index < entries.length; index += 1) {
      const current = entries[index];
      const expectedPrevHash = entries[index + 1]?.hash ?? '';
      const expectedHash = createHash(
        canonicalPayload({
          id: current.id,
          timestamp: current.timestamp,
          actor: current.actor,
          area: current.area,
          action: current.action,
          targetId: current.targetId,
          details: current.details,
          prevHash: current.prevHash
        })
      );

      if (current.prevHash !== expectedPrevHash || current.hash !== expectedHash) {
        return false;
      }
    }

    return true;
  }

  private get auditApi(): AuditApiService | null {
    return this.injector.get(AuditApiService, null);
  }

  private syncFromBackend(): void {
    runBackendSubscription(this.apiConfig.enabled, this.auditApi?.listEntries(), [] as AuditEntry[], (entries) => {
        if (!entries.length) {
          return;
        }

        const normalized = entries
          .filter((entry) => !!entry.id)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 250);

        this.entriesState.set(normalized);
        this.persistEntries();
      });
  }

  private persistEntries(): void {
    saveToStorage(STORAGE_KEY, this.entriesState());
  }

  private escapeCsv(value: string): string {
    const escaped = value.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  }
}
