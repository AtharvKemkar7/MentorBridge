import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationService, VerificationItem, VerificationListResponse } from '../../../core/services/verification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'ab-admin-verifications',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent, ConfirmDialogComponent, ToastComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1 class="page-title">Alumni Verifications</h1>
        <p class="page-subtitle">Review and approve alumni verification requests</p>
      </header>

      <div class="toolbar">
        <div class="search-box">
          <input type="text" placeholder="Search name, email..." [(ngModel)]="search" (ngModelChange)="onSearch()" class="form-input" />
        </div>
        <div class="filter-box">
          <select [(ngModel)]="statusFilter" (ngModelChange)="onSearch()" class="form-select">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <ab-loading-spinner [overlay]="true" [size]="48" />
      } @else if (error()) {
        <ab-error-state [message]="error()!" (retry)="load()" />
      } @else {
        @if (items().length) {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Alumni</th>
                  <th>Email</th>
                  <th>Graduation Year</th>
                  <th>Major</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.id) {
                  <tr>
                    <td>{{ item.userName }}</td>
                    <td>{{ item.userEmail }}</td>
                    <td>{{ item.graduationYear ?? '-' }}</td>
                    <td>{{ item.major ?? '-' }}</td>
                    <td>{{ formatDate(item.submittedAt) }}</td>
                    <td><ab-status-badge [label]="item.status" [variant]="getStatusVariant(item.status)" [dot]="true" /></td>
                    <td class="actions">
                      @if (item.status === 'PENDING') {
                        <button class="btn btn-sm btn-success" (click)="openApprove(item)" [disabled]="processingId() === item.id">Approve</button>
                        <button class="btn btn-sm btn-danger" (click)="openReject(item)" [disabled]="processingId() === item.id">Reject</button>
                      } @else {
                        <span class="text-muted">Completed</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ab-pagination [page]="page()" [size]="size()" [total]="total()" (pageChange)="onPageChange($event)" />
        } @else {
          <ab-empty-state title="No Verifications" message="No verification requests match the current filters." />
        }
      }

      <!-- Approve Confirm -->
      <ab-confirm-dialog
        *ngIf="confirmAction() === 'approve'"
        title="Approve Verification"
        message="Are you sure you want to approve this verification?"
        confirmLabel="Approve"
        cancelLabel="Cancel"
        (confirm)="executeApprove()"
        (cancel)="closeConfirm()"
      />

      <!-- Reject Confirm -->
      <ab-confirm-dialog
        *ngIf="confirmAction() === 'reject'"
        title="Reject Verification"
        [message]="'Please provide a rejection reason.'"
        confirmLabel="Reject"
        cancelLabel="Cancel"
        (confirm)="executeReject()"
        (cancel)="closeConfirm()"
      >
        <textarea class="form-textarea" [(ngModel)]="rejectReason" placeholder="Reason for rejection" rows="3"></textarea>
      </ab-confirm-dialog>

      <ab-toast />
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
    .form-input, .form-select, .form-textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; border-radius: 0.375rem; font-size: 0.875rem; }
    .form-textarea { resize: vertical; }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; font-size: 0.875rem; }
    .data-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.375rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; transition: background 0.2s; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.7rem; }
    .btn-success { background: #28a745; color: #fff; }
    .btn-success:hover:not(:disabled) { background: #218838; }
    .btn-danger { background: #dc3545; color: #fff; }
    .btn-danger:hover:not(:disabled) { background: #c82333; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .text-muted { color: #6c757d; font-size: 0.8125rem; }
    @media (max-width: 768px) {
      .page { padding: 1rem; }
      .toolbar { flex-direction: column; }
    }
  `]
})
export class AdminVerificationsComponent implements OnInit {
  private svc = inject(VerificationService);

  loading = signal(true);
  error = signal<string | null>(null);
  items = signal<VerificationItem[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(10);
  search = '';
  statusFilter = '';

  // confirm dialog state
  confirmAction = signal<'approve' | 'reject' | null>(null);
  selectedItem = signal<VerificationItem | null>(null);
  rejectReason = '';
  processingId = signal<string | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list({ page: this.page(), size: this.size(), search: this.search || undefined, status: this.statusFilter || undefined }).subscribe({
      next: (res: VerificationListResponse) => { this.items.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Failed to load'); this.loading.set(false); }
    });
  }

  onSearch(): void { this.page.set(0); this.load(); }
  onPageChange(p: number): void { this.page.set(p); this.load(); }

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    switch (status) { case 'APPROVED': return 'success'; case 'PENDING': return 'warning'; case 'REJECTED': return 'danger'; default: return 'default'; }
  }

  formatDate(s: string): string { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }

  openApprove(item: VerificationItem) { this.selectedItem.set(item); this.confirmAction.set('approve'); }
  openReject(item: VerificationItem) { this.selectedItem.set(item); this.rejectReason = ''; this.confirmAction.set('reject'); }
  closeConfirm() { this.confirmAction.set(null); this.selectedItem.set(null); this.rejectReason = ''; }

  executeApprove(): void {
    const item = this.selectedItem(); if (!item) return;
    this.processingId.set(item.id);
    this.svc.approve(item.id).subscribe({
      next: () => { this.closeConfirm(); this.load(); this.showToast('Verification approved'); },
      error: (err) => { this.showToast(err?.message || 'Approve failed', 'error'); this.processingId.set(null); }
    });
  }

  executeReject(): void {
    const item = this.selectedItem(); if (!item || !this.rejectReason.trim()) return;
    this.processingId.set(item.id);
    this.svc.reject(item.id, this.rejectReason).subscribe({
      next: () => { this.closeConfirm(); this.load(); this.showToast('Verification rejected'); },
      error: (err) => { this.showToast(err?.message || 'Reject failed', 'error'); this.processingId.set(null); }
    });
  }

  // simple toast via component? assume ToastComponent provides static method? We'll just console.log for now.
  showToast(msg: string, type: 'success' | 'error' = 'success') { console.log(`[${type}]`, msg); }
}