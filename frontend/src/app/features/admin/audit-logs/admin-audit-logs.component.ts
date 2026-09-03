import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLogEntry, AuditLogListResponse } from '../../../core/services/audit-log.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'ab-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1 class="page-title">Audit Logs</h1>
        <p class="page-subtitle">System audit trail</p>
      </header>

      <div class="toolbar">
        <div class="search-box"><input type="text" placeholder="Search action, actor..." [(ngModel)]="search" (ngModelChange)="onSearch()" class="form-input" /></div>
        <div class="filter-box"><input type="date" [(ngModel)]="fromDate" (ngModelChange)="onSearch()" class="form-input" placeholder="From" /></div>
        <div class="filter-box"><input type="date" [(ngModel)]="toDate" (ngModelChange)="onSearch()" class="form-input" placeholder="To" /></div>
      </div>

      @if (loading()) { <ab-loading-spinner [overlay]="true" [size]="48" /> }
      @else if (error()) { <ab-error-state [message]="error()!" (retry)="load()" /> }
      @else {
        @if (items().length) {
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Resource</th><th>Status</th><th>Details</th></tr></thead>
              <tbody>
                @for (log of items(); track log.id) {
                  <tr>
                    <td>{{ formatDateTime(log.timestamp) }}</td>
                    <td>{{ log.actorName }}</td>
                    <td>{{ log.action }}</td>
                    <td>{{ log.resourceType }} / {{ log.resourceId }}</td>
                    <td><span class="status-badge" [class.success]="log.status==='SUCCESS'" [class.danger]="log.status==='FAILURE'">{{ log.status }}</span></td>
                    <td><pre class="metadata">{{ log.metadata ? (log.metadata | json) : '-' }}</pre></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ab-pagination [page]="page()" [size]="size()" [total]="total()" (pageChange)="onPageChange($event)" />
        } @else { <ab-empty-state title="No Audit Logs" message="No audit entries match the current filters." /> }
      }
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.25rem; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 250px; }
    .filter-box { min-width: 180px; }
    .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; border-radius: 0.375rem; font-size: 0.875rem; }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e9ecef; font-size: 0.8125rem; vertical-align: top; }
    .data-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
    .metadata { margin: 0; white-space: pre-wrap; font-size: 0.7rem; max-height: 120px; overflow: auto; }
    .status-badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
    .status-badge.success { background: #d4edda; color: #155724; }
    .status-badge.danger { background: #f8d7da; color: #721c24; }
    @media (max-width: 768px) { .page { padding: 1rem; } .toolbar { flex-direction: column; } }
  `]
})
export class AdminAuditLogsComponent implements OnInit {
  private svc = inject(AuditLogService);

  loading = signal(true);
  error = signal<string | null>(null);
  items = signal<AuditLogEntry[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(20);
  search = '';
  fromDate = '';
  toDate = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set(null);
    this.svc.list({ page: this.page(), size: this.size(), action: this.search || undefined, from: this.fromDate || undefined, to: this.toDate || undefined }).subscribe({
      next: (res: AuditLogListResponse) => { this.items.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Failed to load'); this.loading.set(false); }
    });
  }
  onSearch(): void { this.page.set(0); this.load(); }
  onPageChange(p: number): void { this.page.set(p); this.load(); }

  formatDateTime(s: string): string { return new Date(s).toLocaleString(undefined, { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
}