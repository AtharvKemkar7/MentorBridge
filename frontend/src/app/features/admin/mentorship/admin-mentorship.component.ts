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

interface MentorshipItem {
  id: string;
  mentorName: string;
  menteeName: string;
  category: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  endedAt?: string;
}

interface MentorshipListResponse { items: MentorshipItem[]; total: number; page: number; size: number; }

@Injectable({ providedIn: 'root' })
export class AdminMentorshipService {
  private base = `${environment.apiBaseUrl}/admin/mentorships`;
  constructor(private http: HttpClient) {}
  list(params?: { page?: number; size?: number; status?: string }): Observable<MentorshipListResponse> {
    let hp = new HttpParams();
    if (params?.page) hp = hp.set('page', params.page);
    if (params?.size) hp = hp.set('size', params.size);
    if (params?.status) hp = hp.set('status', params.status);
    return this.http.get<MentorshipListResponse>(this.base, { params: hp });
  }
}

@Component({
  selector: 'ab-admin-mentorship',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1 class="page-title">Mentorship Oversight</h1>
        <p class="page-subtitle">View mentorship relationships across the platform</p>
      </header>

      <div class="toolbar">
        <div class="filter-box"><select [(ngModel)]="statusFilter" (ngModelChange)="onFilter()" class="form-select"><option value="">All Statuses</option><option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></div>
      </div>

      @if (loading()) { <ab-loading-spinner [overlay]="true" [size]="48" /> }
      @else if (error()) { <ab-error-state [message]="error()!" (retry)="load()" /> }
      @else {
        @if (items().length) {
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr><th>Mentor</th><th>Mentee</th><th>Category</th><th>Status</th><th>Started</th><th>Ended</th></tr></thead>
              <tbody>
                @for (m of items(); track m.id) {
                  <tr>
                    <td>{{ m.mentorName }}</td>
                    <td>{{ m.menteeName }}</td>
                    <td>{{ m.category }}</td>
                    <td><ab-status-badge [label]="m.status" [variant]="getVariant(m.status)" [dot]="true" /></td>
                    <td>{{ formatDate(m.startedAt) }}</td>
                    <td>{{ m.endedAt ? formatDate(m.endedAt) : '-' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ab-pagination [page]="page()" [size]="size()" [total]="total()" (pageChange)="onPageChange($event)" />
        } @else { <ab-empty-state title="No Mentorships" message="No mentorship records match the current filter." /> }
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
    .data-table th, .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e9ecef; font-size: 0.875rem; }
    .data-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
    @media (max-width: 768px) { .page { padding: 1rem; } .toolbar { flex-direction: column; } }
  `]
})
export class AdminMentorshipComponent implements OnInit {
  private svc = inject(AdminMentorshipService);

  loading = signal(true);
  error = signal<string | null>(null);
  items = signal<MentorshipItem[]>([]);
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

  getVariant(s: string): 'success'|'info'|'warning'|'danger'|'default' {
    switch(s){ case 'ACTIVE': return 'success'; case 'PENDING': return 'warning'; case 'COMPLETED': return 'info'; case 'CANCELLED': return 'danger'; default: return 'default'; }
  }
  formatDate(s: string): string { return new Date(s).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' }); }
}