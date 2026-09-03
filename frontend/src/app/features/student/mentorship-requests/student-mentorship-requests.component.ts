import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { MentorshipRequestSummary, MentorshipRequest } from '../../../core/models/mentorship.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'ab-student-mentorship-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, ConfirmDialogComponent, ToastContainerComponent],
  template: `
    <div class="mentorship-requests">
      <ab-toast-container />
      <ab-confirm-dialog
        [open]="showConfirmDialog()"
        [title]="confirmTitle()"
        [message]="confirmMessage()"
        [confirmLabel]="'Cancel Request'"
        [cancelLabel]="'Keep Request'"
        [variant]="'danger'"
        (confirm)="confirmCancel()"
        (cancel)="showConfirmDialog.set(false)"
      />

      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Mentorship Requests</h1>
          <p class="page-subtitle">Track and manage your mentorship requests</p>
        </div>
        <a routerLink="/student/alumni" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          Discover Alumni
        </a>
      </header>

      @if (loading()) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="false" message="Loading requests..." />
        </div>
      } @else if (error()) {
        <ab-error-state [message]="error()" (retry)="loadRequests()" />
      } @else {
        <!-- Filter Tabs -->
        <nav class="filter-tabs" aria-label="Filter requests by status">
          @for (tab of statusTabs; track tab.value) {
            <button
              type="button"
              class="filter-tab"
              [class.active]="activeTab() === tab.value"
              (click)="setActiveTab(tab.value)"
            >
              {{ tab.label }}
              <span class="tab-count">{{ getTabCount(tab.value) }}</span>
            </button>
          }
        </nav>

        @if (filteredRequests().length) {
          <div class="requests-list">
            @for (request of filteredRequests(); track request.id) {
              <article class="request-card" [class]="'status-' + request.status.toLowerCase()">
                <div class="request-header">
                  <div class="mentor-info">
                    <div class="avatar" [style.background-image]="request.mentorAvatarUrl ? 'url(' + request.mentorAvatarUrl + ')' : ''">
                      @if (!request.mentorAvatarUrl) {
                        {{ getInitials(request.mentorName) }}
                      }
                    </div>
                    <div class="mentor-details">
                      <a [routerLink]="['/student/alumni', request.mentorId]" class="mentor-name">{{ request.mentorName }}</a>
                      <span class="request-category">{{ request.category }}</span>
                    </div>
                  </div>
                  <div class="request-status">
                    <ab-status-badge [label]="request.status" [variant]="getStatusVariant(request.status)" />
                    <span class="request-date">{{ formatDate(request.requestedAt) }}</span>
                  </div>
                </div>

                <div class="request-message">{{ request.message }}</div>

                <div class="request-footer">
                  <div class="request-meta">
                    @if (request.respondedAt) {
                      <span class="meta-item">Responded: {{ formatDate(request.respondedAt!) }}</span>
                    }
                  </div>
                  <div class="request-actions">
                    @if (request.status === 'PENDING') {
                      <button type="button" class="btn-danger btn-sm" (click)="openCancelDialog(request)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        Cancel
                      </button>
                    }
                    <a [routerLink]="['/student/alumni', request.mentorId]" class="btn-secondary btn-sm">View Profile</a>
                  </div>
                </div>
              </article>
            }
          </div>
        } @else {
          <ab-empty-state
            [title]="getEmptyTitle()"
            [message]="getEmptyMessage()"
            [actionLabel]="activeTab() === 'PENDING' ? 'Discover Alumni' : ''"
            [actionRoute]="activeTab() === 'PENDING' ? '/student/alumni' : ''"
            [centered]="true"
          />
        }
      }
    </div>
  `,
  styles: [`
    .mentorship-requests { padding: 1.5rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 500; color: #fff; background: #2c3e50; border: none; border-radius: 0.375rem; cursor: pointer; transition: background 0.2s ease; text-decoration: none; }
    .btn-primary:hover { background: #1a252f; }
    .btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 500; color: #495057; background: #fff; border: 1px solid #dee2e6; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s ease; text-decoration: none; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    .btn-danger { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 500; color: #fff; background: #dc3545; border: none; border-radius: 0.375rem; cursor: pointer; transition: background 0.2s ease; }
    .btn-danger:hover { background: #c82333; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }

    .loading-container { display: flex; justify-content: center; padding: 3rem; }

    .filter-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #e9ecef; padding-bottom: 0.5rem; overflow-x: auto; }
    .filter-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #6c757d; background: transparent; border: none; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }
    .filter-tab:hover { background: #f8f9fa; color: #2c3e50; }
    .filter-tab.active { color: #2c3e50; background: #e7f3ff; }
    .tab-count { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 0.375rem; font-size: 0.75rem; font-weight: 600; color: #fff; background: #2c3e50; border-radius: 9999px; }
    .filter-tab.active .tab-count { background: #fff; color: #2c3e50; }

    .requests-list { display: flex; flex-direction: column; gap: 1rem; }
    .request-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .request-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border-color: #dee2e6; }
    .request-card.status-pending { border-left: 4px solid #ffc107; }
    .request-card.status-accepted { border-left: 4px solid #28a745; }
    .request-card.status-rejected { border-left: 4px solid #dc3545; }
    .request-card.status-cancelled { border-left: 4px solid #6c757d; }

    .request-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem 1.5rem; gap: 1rem; }
    .mentor-info { display: flex; align-items: center; gap: 1rem; min-width: 0; flex: 1; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .mentor-name { display: block; font-weight: 600; color: #2c3e50; text-decoration: none; }
    .mentor-name:hover { text-decoration: underline; }
    .request-category { display: block; font-size: 0.8125rem; color: #6c757d; }
    .request-status { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; text-align: right; flex-shrink: 0; }
    .request-date { font-size: 0.75rem; color: #6c757d; }

    .request-message { padding: 0 1.5rem 1rem; font-size: 0.875rem; line-height: 1.6; color: #495057; border-bottom: 1px solid #e9ecef; }

    .request-footer { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .request-meta { display: flex; gap: 1rem; }
    .meta-item { font-size: 0.8125rem; color: #6c757d; }
    .request-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    @media (max-width: 768px) {
      .mentorship-requests { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .request-header { flex-direction: column; align-items: flex-start; }
      .request-status { align-items: flex-start; width: 100%; }
    }
  `]
})
export class StudentMentorshipRequestsComponent implements OnInit {
  studentService = inject(StudentService);
  mentorshipService = inject(MentorshipService);
  toast = inject(ToastContainerComponent);

  requests = signal<MentorshipRequestSummary[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'>('ALL');

  showConfirmDialog = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  pendingCancelRequest = signal<MentorshipRequestSummary | null>(null);

  statusTabs = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  filteredRequests = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ALL') return this.requests();
    return this.requests().filter(r => r.status === tab);
  });

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);
    this.studentService.getMentorshipRequests().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load requests');
        this.loading.set(false);
      }
    });
  }

  setActiveTab(tab: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'): void {
    this.activeTab.set(tab);
  }

  getTabCount(status: string): number {
    if (status === 'ALL') return this.requests().length;
    return this.requests().filter(r => r.status === status).length;
  }

  openCancelDialog(request: MentorshipRequestSummary): void {
    this.pendingCancelRequest.set(request);
    this.confirmTitle.set('Cancel Mentorship Request');
    this.confirmMessage.set(`Are you sure you want to cancel your mentorship request to ${request.mentorName}? This action cannot be undone.`);
    this.showConfirmDialog.set(true);
  }

  confirmCancel(): void {
    const request = this.pendingCancelRequest();
    if (!request) return;

    this.mentorshipService.cancelRequest(request.id).subscribe({
      next: () => {
        this.toast.success('Request Cancelled', 'Your mentorship request has been cancelled.');
        this.loadRequests();
        this.showConfirmDialog.set(false);
        this.pendingCancelRequest.set(null);
      },
      error: (err) => {
        this.toast.error('Cancel Failed', err.error?.message || 'Failed to cancel request');
        this.showConfirmDialog.set(false);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    switch (status) { case 'ACCEPTED': return 'success'; case 'PENDING': return 'warning'; case 'REJECTED': return 'danger'; default: return 'default'; }
  }

  getEmptyTitle(): string {
    switch (this.activeTab()) {
      case 'PENDING': return 'No Pending Requests';
      case 'ACCEPTED': return 'No Accepted Requests';
      case 'REJECTED': return 'No Rejected Requests';
      case 'CANCELLED': return 'No Cancelled Requests';
      default: return 'No Requests Yet';
    }
  }

  getEmptyMessage(): string {
    switch (this.activeTab()) {
      case 'PENDING': return 'Your pending mentorship requests will appear here.';
      case 'ACCEPTED': return 'Accepted requests will show here. Start your mentorship journey!';
      case 'REJECTED': return 'Rejected requests will appear here. Don\'t give up - keep exploring!';
      case 'CANCELLED': return 'Cancelled requests will appear here.';
      default: return 'Discover alumni and send mentorship requests to get started.';
    }
  }
}