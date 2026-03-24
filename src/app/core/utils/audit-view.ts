import { AuditArea, AuditEntry } from '../services/audit-log/audit-log.service';

export const AUDIT_AREA_FILTER_OPTIONS: ReadonlyArray<{ value: 'all' | AuditArea; labelKey: string }> = [
  { value: 'all', labelKey: 'account.admin.auditControls.all' },
  { value: 'fraud', labelKey: 'account.admin.auditControls.fraud' },
  { value: 'returns', labelKey: 'account.admin.auditControls.returns' },
  { value: 'orders', labelKey: 'account.admin.auditControls.orders' },
  { value: 'inventory', labelKey: 'account.admin.auditControls.inventory' }
];

const AUDIT_AREA_LABEL_KEYS: Record<AuditArea, string> = {
  fraud: 'account.admin.auditControls.fraud',
  returns: 'account.admin.auditControls.returns',
  orders: 'account.admin.auditControls.orders',
  inventory: 'account.admin.auditControls.inventory'
};

export const AUDIT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export type AuditPageSize = (typeof AUDIT_PAGE_SIZE_OPTIONS)[number];

export function filterAuditEntries(entries: AuditEntry[], areaFilter: 'all' | AuditArea, query: string): AuditEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  return entries
    .filter((entry) => areaFilter === 'all' || entry.area === areaFilter)
    .filter((entry) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        entry.action.toLowerCase().includes(normalizedQuery) ||
        entry.targetId.toLowerCase().includes(normalizedQuery) ||
        entry.details.toLowerCase().includes(normalizedQuery) ||
        entry.actor.toLowerCase().includes(normalizedQuery)
      );
    });
}

export function getAuditTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function parseAuditPageSize(value: string): AuditPageSize | null {
  const parsed = Number(value);
  return AUDIT_PAGE_SIZE_OPTIONS.includes(parsed as AuditPageSize) ? (parsed as AuditPageSize) : null;
}

export function getAuditTargetLink(entry: AuditEntry): string | null {
  if (entry.area === 'fraud' && entry.targetId.startsWith('FR-')) {
    return `/admin/fraud/${entry.targetId}`;
  }

  if ((entry.area === 'orders' || entry.area === 'returns') && entry.targetId.startsWith('PH-')) {
    return `/orders/${entry.targetId}`;
  }

  return null;
}

export function getAuditAreaLabelKey(area: AuditArea): string {
  return AUDIT_AREA_LABEL_KEYS[area];
}

export function formatAuditAction(action: string): string {
  return action
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function downloadTextFile(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
