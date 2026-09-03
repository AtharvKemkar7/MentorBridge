import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlumniService } from '../../../core/services/alumni.service';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { MentorshipRequestSummary } from '../../../core/models/alumni.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'ab-alumni-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent, ToastContainerComponent, ConfirmDialogComponent],
  template: `
    <div class="requests-page">
      <ab-toast-container />
      <ab-confirm-dialog
        [open]="showConfirmDialog()"
        [title]="confirmTitle()"
        [message]="confirmMessage()"
        [confirmLabel]="confirmLabel()"
        [cancelLabel]="'Cancel'"
        [variant]="confirmVariant()"
        (confirm)="confirmAction()"
        (cancel)="showConfirmDialog.set(false)"
      />

      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Mentorship Requests</h1>
          <p class="page-subtitle">Review and respond to incoming mentorship requests</p>
        </div>
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

        @if (paginatedRequests().length) {
          <div class="requests-list">
            @for (request of paginatedRequests(); track request.id) {
              <article class="request-card" [class]="'status-' + request.status.toLowerCase()">
                <div class="request-header">
                  <div class="student-info">
                    <div class="avatar" [style.background-image]="request.studentAvatarUrl ? 'url(' + request.studentAvatarUrl + ')' : ''">
                      @if (!request.studentAvatarUrl) {
                        {{ getInitials(request.studentName) }}
                      }
                    </div>
                    <div class="student-details">
                      <span class="student-name">{{ request.studentName }}</span>
                      <span class="student-meta">{{ request.studentMajor || 'Student' }}{{ request.studentGraduationYear ? ' • Class of ' + request.studentGraduationYear : '' }}</span>
                    </div>
                  </div>
                  <div class="request-status">
                    <ab-status-badge [label]="request.status" [variant]="getStatusVariant(request.status)" />
                    <span class="request-date">{{ formatDate(request.requestedAt) }}</span>
                  </div>
                </div>

                <div class="request-category">{{ request.category }}</div>
                <div class="request-message">{{ request.message }}</div>

                <div class="request-footer">
                  <div class="request-actions">
                    @if (request.status === 'PENDING') {
                      <button type="button" class="btn-primary btn-sm" (click)="openAcceptDialog(request)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Accept
                      </button>
                      <button type="button" class="btn-danger btn-sm" (click)="openRejectDialog(request)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        Reject
                      </button>
                    } @else if (request.status === 'ACCEPTED') {
                      <a [routerLink]="['/alumni/mentorships']" class="btn-secondary btn-sm">View Mentorship</a>
                    }
                    <a [routerLink]="['/student/alumni', request.studentId]" class="btn-secondary btn-sm">View Profile</a>
                  </div>
                </div>
              </article>
            }
          </div>

          <ab-pagination [currentPage]="currentPage()" [totalPages]="totalPages()" [totalElements]="totalElements()" (pageChange)="onPageChange($event)" />
        } @else {
          <ab-empty-state
            [title]="getEmptyTitle()"
            [message]="getEmptyMessage()"
            [centered]="true"
          />
        }
      }
    </div>
  `,
  styles: [`
    .requests-page { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }

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

    .request-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem 1.5rem; gap: 1rem; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
    .student-info { display: flex; align-items: center; gap: 1rem; min-width: 0; flex: 1; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .student-name { display: block; font-weight: 600; color: #2c3e50; }
    .student-meta { display: block; font-size: 0.8125rem; color: #6c757d; }
    .request-status { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; text-align: right; flex-shrink: 0; }
    .request-date { font-size: 0.75rem; color: #6c757d; }

    .request-category { padding: 0 1.5rem 0.5rem; font-size: 0.875rem; font-weight: 500; color: #2c3e50; background: #e7f3ff; color: #1a73e8; display: inline-block; margin: 0.75rem 1.5rem; padding: 0.25rem 0.75rem; border-radius: 0.375rem; }
    .request-message { padding: 0 1.5rem 1rem; font-size: 0.875rem; line-height: 1.6; color: #495057; border-bottom: 1px solid #e9ecef; }

    .request-footer { padding: 1rem 1.5rem; background: #f8f9fa; }
    .request-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-primary, .btn-secondary, .btn-danger {
      display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; transition: all 0.2s ease; text-decoration: none;
    }
    .btn-primary { padding: 0.5rem 1rem; color: #fff; background: #28a745; }
    .btn-primary:hover { background: #218838; }
    .btn-secondary { padding: 0.5rem 1rem; color: #495057; background: #fff; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    .btn-danger { padding: 0.5rem 1rem; color: #fff; background: #dc3545; }
    .btn-danger:hover { background: #c82333; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }

    @media (max-width: 768px) {
      .requests-page { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .request-header { flex-direction: column; align-items: flex-start; }
      .request-status { align-items: flex-start; width: 100%; }
    }
  `]
})
export class AlumniRequestsComponent implements OnInit {
  alumniService = inject(AlumniService);
  mentorshipService = inject(MentorshipService);
  toast = inject(ToastContainerComponent);

  allRequests = signal<MentorshipRequestSummary[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'>('ALL');
  currentPage = signal(1);
  pageSize = 10;

  totalElements = computed(() => this.filteredAllRequests().length);
  totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize));

  paginatedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAllRequests().slice(start, start + this.pageSize);
  });

  filteredAllRequests = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ALL') return this.allRequests();
    return this.allRequests().filter(r => r.status === tab);
  });

  showConfirmDialog = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmLabel = signal('');
  confirmVariant = signal<'danger' | 'primary'>('primary');
  confirmActionFn = signal<() => void>(() => {});
  pendingRequest = signal<MentorshipRequestSummary | null>(null);

  statusTabs = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);
    this.alumniService.getMentorshipRequests({ page: 0, size: 100 }).subscribe({
      next: (res) => {
        this.allRequests.set(res.content);
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
    this.currentPage.set(1);
  }

  getTabCount(status: string): number {
    if (status === 'ALL') return this.allRequests().length;
    return this.allRequests().filter(r => r.status === status).length;
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  openAcceptDialog(request: MentorshipRequestSummary): void {
    this.pendingRequest.set(request);
    this.confirmTitle.set('Accept Request');
    this.confirmMessage.set(`Accept mentorship request from ${request.studentName} for ${request.category}?`);
    this.confirmLabel.set('Accept');
    this.confirmVariant.set('primary');
    this.confirmActionFn.set(() => this.acceptRequest(request));
    this.showConfirmDialog.set(true);
  }

  openRejectDialog(request: MentorshipRequestSummary): void {
    this.pendingRequest.set(request);
    this.confirmTitle.set('Reject Request');
    this.confirmMessage.set(`Reject mentorship request from ${request.studentName}? This action cannot be undone.`);
    this.confirmLabel.set('Reject');
    this.confirmVariant.set('danger');
    this.confirmActionFn.set(() => this.rejectRequest(request));
    this.showConfirmDialog.set(true);
  }

  confirmAction(): void {
    this.confirmActionFn()();
    this.showConfirmDialog.set(false);
    this.pendingRequest.set(null);
  }

  acceptRequest(request: MentorshipRequestSummary): void {
    this.mentorshipService.respondToRequest({ requestId: request.id, action: 'ACCEPT' }).subscribe({
      next: () => {
        this.toast.success('Request Accepted', `You've accepted ${request.studentName}'s mentorship request.`);
        this.loadRequests();
      },
      error: (err) => this.toast.error('Accept Failed', err.error?.message || 'Failed to accept request')
    });
  }

  rejectRequest(request: MentorshipRequestSummary): void {
    this.mentorshipService.respondToRequest({ requestId: request.id, action: 'REJECT' }).subscribe({
      next: () => {
        this.toast.success('Request Rejected', `You've rejected ${request.studentName}'s mentorship request.`);
        this.loadRequests();
      },
      error: (err) => this.toast.error('Reject Failed', err.error?.message || 'Failed to reject request')
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
      case 'PENDING': return 'New mentorship requests from students will appear here.';
      case 'ACCEPTED': return 'Accepted requests will show here. View them in Mentorships.';
      case 'REJECTED': return 'Rejected requests will appear here.';
      case 'CANCELLED': return 'Cancelled requests will appear here.';
      default: return 'Student mentorship requests will appear here once you set up your profile.';
    }
  }
}