import { Component, inject, OnInit, signal, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { RatingDisplayComponent } from '../../../shared/components/rating-display/rating-display.component';

interface ReviewItem {
  id: string;
  mentorName: string;
  studentName: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  createdAt: string;
}

interface ReviewListResponse { items: ReviewItem[]; total: number; page: number; size: number; }

@Injectable({ providedIn: 'root' })
export class AdminReviewService {
  private base = `${environment.apiBaseUrl}/admin/reviews`;
  constructor(private http: HttpClient) {}
  list(params?: { page?: number; size?: number; status?: string }): Observable<ReviewListResponse> {
    let hp = new HttpParams();
    if (params?.page) hp = hp.set('page', params.page);
    if (params?.size) hp = hp.set('size', params.size);
    if (params?.status) hp = hp.set('status', params.status);
    return this.http.get<ReviewListResponse>(this.base, { params: hp });
  }
  moderate(id: string, action: 'approve' | 'reject' | 'flag'): Observable<ReviewItem> {
    return this.http.post<ReviewItem>(`${this.base}/${id}/${action}`, {});
  }
}

@Component({
  selector: 'ab-admin-reviews',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent, RatingDisplayComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1 class="page-title">Review Moderation</h1>
        <p class="page-subtitle">Moderate mentor reviews</p>
      </header>

      <div class="toolbar">
        <div class="filter-box"><select [(ngModel)]="statusFilter" (ngModelChange)="onFilter()" class="form-select"><option value="">All Statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="FLAGGED">Flagged</option></select></div>
      </div>

      @if (loading()) { <ab-loading-spinner [overlay]="true" [size]="48" /> }
      @else if (error()) { <ab-error-state [message]="error()!" (retry)="load()" /> }
      @else {
        @if (items().length) {
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr><th>Mentor</th><th>Student</th><th>Rating</th><th>Comment</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                @for (r of items(); track r.id) {
                  <tr>
                    <td>{{ r.mentorName }}</td>
                    <td>{{ r.studentName }}</td>
                    <td><ab-rating-display [value]="r.rating" [readonly]="true" [size]="'sm'" /></td>
                    <td class="comment">{{ r.comment }}</td>
                    <td><ab-status-badge [label]="r.status" [variant]="getVariant(r.status)" [dot]="true" /></td>
                    <td>{{ formatDate(r.createdAt) }}</td>
                    <td class="actions">
                      @if (r.status === 'PENDING') {
                        <button class="btn btn-sm btn-success" (click)="moderate(r.id,'approve')">Approve</button>
                        <button class="btn btn-sm btn-danger" (click)="moderate(r.id,'reject')">Reject</button>
                        <button class="btn btn-sm btn-warning" (click)="moderate(r.id,'flag')">Flag</button>
                      } @else { <span class="text-muted">Moderated</span> }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ab-pagination [page]="page()" [size]="size()" [total]="total()" (pageChange)="onPageChange($event)" />
        } @else { <ab-empty-state title="No Reviews" message="No reviews match the current filter." /> }
      }
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.25rem; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .filter-box { min-width: 200px; }
    .form-select { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; border-radius: 0.375rem; font-size: 0.875rem; }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e9ecef; font-size: 0.875rem; vertical-align: top; }
    .data-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
    .comment { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.375rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.7rem; }
    .btn-success { background: #28a745; color: #fff; } .btn-success:hover { background: #218838; }
    .btn-danger { background: #dc3545; color: #fff; } .btn-danger:hover { background: #c82333; }
    .btn-warning { background: #ffc107; color: #212529; } .btn-warning:hover { background: #e0a800; }
    .text-muted { color: #6c757d; font-size: 0.8125rem; }
    @media (max-width: 768px) { .page { padding: 1rem; } .toolbar { flex-direction: column; } }
  `]
})
export class AdminReviewsComponent implements OnInit {
  private svc = inject(AdminReviewService);

  loading = signal(true);
  error = signal<string | null>(null);
  items = signal<ReviewItem[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(10);
  statusFilter = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set(null);
    this.svc.list({ page: this.page(), size: this.size(), status: this.statusFilter || undefined }).subscribe({
      next: (res) => { this.items.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Failed to load'); this.loading.set(false); }
    });
  }
  onFilter(): void { this.page.set(0); this.load(); }
  onPageChange(p: number): void { this.page.set(p); this.load(); }

  moderate(id: string, action: 'approve'|'reject'|'flag'): void {
    this.svc.moderate(id, action).subscribe({ next: () => this.load(), error: (err) => alert(err?.message || 'Action failed') });
  }

  getVariant(s: string): 'success'|'info'|'warning'|'danger'|'default' {
    switch(s){ case 'APPROVED': return 'success'; case 'PENDING': return 'warning'; case 'REJECTED': return 'danger'; case 'FLAGGED': return 'info'; default: return 'default'; }
  }
  formatDate(s: string): string { return new Date(s).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' }); }
}