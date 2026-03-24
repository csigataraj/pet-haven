import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';

import { AuditArea, AuditEntry, AuditLogService } from '../../../../core';
import {
  AUDIT_AREA_FILTER_OPTIONS,
  AUDIT_PAGE_SIZE_OPTIONS,
  downloadTextFile,
  filterAuditEntries,
  formatAuditAction,
  getAuditAreaLabelKey,
  getAuditTargetLink,
  getAuditTotalPages,
  paginateItems,
  parseAuditPageSize
} from '../../../../core/utils/audit-view';
import { PageHeaderComponent, TranslatePipe } from '../../../../shared/components';

@Component({
  selector: 'app-admin-audit',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
    TranslatePipe
  ],
  templateUrl: './admin-audit.component.html',
  styleUrl: './admin-audit.component.scss'
})
export class AdminAuditComponent {
  private readonly auditLogService = inject(AuditLogService);
  readonly auditAreaOptions = AUDIT_AREA_FILTER_OPTIONS;
  readonly auditPageSizeOptions = AUDIT_PAGE_SIZE_OPTIONS;

  readonly auditChainValid = this.auditLogService.chainValid;
  readonly auditAreaFilter = signal<'all' | AuditArea>('all');
  readonly auditQuery = signal('');
  readonly auditPage = signal(1);
  readonly auditPageSize = signal(10);

  readonly filteredAuditEntries = computed(() => {
    return filterAuditEntries(this.auditLogService.entries(), this.auditAreaFilter(), this.auditQuery());
  });

  readonly auditTotalPages = computed(() => getAuditTotalPages(this.filteredAuditEntries().length, this.auditPageSize()));

  readonly auditEntries = computed(() => {
    const page = Math.min(this.auditPage(), this.auditTotalPages());
    return paginateItems(this.filteredAuditEntries(), page, this.auditPageSize());
  });

  readonly canPreviousAuditPage = computed(() => this.auditPage() > 1);
  readonly canNextAuditPage = computed(() => this.auditPage() < this.auditTotalPages());

  setAuditAreaFilter(value: string): void {
    if (value === 'all') {
      this.auditAreaFilter.set('all');
      this.auditPage.set(1);
      return;
    }
    this.auditAreaFilter.set(value as AuditArea);
    this.auditPage.set(1);
  }

  setAuditQuery(value: string): void {
    this.auditQuery.set(value);
    this.auditPage.set(1);
  }

  setAuditPageSize(value: string): void {
    const parsed = parseAuditPageSize(value);
    if (parsed === null) {
      return;
    }
    this.auditPageSize.set(parsed);
    this.auditPage.set(1);
  }

  previousAuditPage(): void {
    const current = this.auditPage();
    this.auditPage.set(Math.max(1, current - 1));
  }

  nextAuditPage(): void {
    const current = this.auditPage();
    const maxPage = this.auditTotalPages();
    this.auditPage.set(Math.min(maxPage, current + 1));
  }

  auditTargetLink(entry: AuditEntry): string | null {
    return getAuditTargetLink(entry);
  }

  auditAreaLabelKey(area: AuditArea): string {
    return getAuditAreaLabelKey(area);
  }

  auditActionLabel(action: string): string {
    return formatAuditAction(action);
  }

  exportAuditCsv(): void {
    const content = this.auditLogService.toCsv(this.filteredAuditEntries());
    downloadTextFile(content, 'text/csv;charset=utf-8', 'audit-log.csv');
  }

  exportAuditJson(): void {
    const content = JSON.stringify(this.filteredAuditEntries(), null, 2);
    downloadTextFile(content, 'application/json;charset=utf-8', 'audit-log.json');
  }
}
