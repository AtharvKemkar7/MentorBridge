import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { SessionService } from '../../../core/services/session.service';
import { ReviewService } from '../../../core/services/review.service';
import { Session, SessionPageResponse } from '../../../core/models/session.model';
import { Review, ReviewEligibility } from '../../../core/models/review.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';
import { RatingDisplayComponent } from '../../../shared/components/rating-display/rating-display.component';

@Component({
  selector: 'ab-student-sessions',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent, ConfirmDialogComponent, ToastContainerComponent, RatingDisplayComponent],
  template: `
    <div class="sessions">
      <ab-toast-container />
      <ab-confirm-dialog
        [open]="showReviewDialog()"
        [title]="'Leave a Review'"
        [message]="reviewDialogMessage()"
        [confirmLabel]="'Submit Review'"
        [cancelLabel]="'Cancel'"
        (confirm)="submitReview()"
        (cancel)="closeReviewDialog()"
      />

      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">My Sessions</h1>
          <p class="page-subtitle">Track your mentorship session history</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="false" message="Loading sessions..." />
        </div>
      } @else if (error()) {
        <ab-error-state [message]="error()" (retry)="loadSessions()" />
      } @else {
        <!-- Filter Tabs -->
        <nav class="filter-tabs" aria-label="Filter sessions by status">
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

        @if (sessions().length) {
          <div class="sessions-list">
            @for (session of sessions(); track session.id) {
              <article class="session-card" [class]="'status-' + session.status.toLowerCase()">
                <div class="session-header">
                  <div class="mentor-info">
                    <div class="avatar" [style.background-image]="session.mentor?.avatarUrl ? 'url(' + session.mentor!.avatarUrl + ')' : ''">
                      @if (!session.mentor?.avatarUrl) {
                        {{ getInitials(session.mentor?.firstName + ' ' + session.mentor?.lastName) }}
                      }
                    </div>
                    <div class="mentor-details">
                      <span class="mentor-name">{{ session.mentor?.firstName }} {{ session.mentor?.lastName }}</span>
                      <span class="session-type">{{ session.sessionTypeName }}</span>
                    </div>
                  </div>
                  <div class="session-status">
                    <ab-status-badge [label]="session.status" [variant]="getStatusVariant(session.status)" [dot]="true" />
                  </div>
                </div>

                <div class="session-details">
                  <div class="detail-row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>{{ formatDateTime(session.scheduledAt, session.timezone) }}</span>
                    <span class="timezone-badge">{{ session.timezone }}</span>
                  </div>
                  <div class="detail-row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>{{ session.durationMinutes }} minutes</span>
                  </div>
                  @if (session.startedAt) {
                    <div class="detail-row">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 4 15 4 15 4 22 11 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                      <span>Started: {{ formatDateTime(session.startedAt!, session.timezone) }}</span>
                    </div>
                  }
                  @if (session.endedAt) {
                    <div class="detail-row">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span>Ended: {{ formatDateTime(session.endedAt!, session.timezone) }}</span>
                    </div>
                  }
                  @if (session.notes) {
                    <div class="detail-row notes">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span>{{ session.notes }}</span>
                    </div>
                  }
                </div>

                <div class="session-footer">
                  <div class="session-actions">
                    @if (session.meetingLink && (session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS')) {
                      <a [href]="session.meetingLink" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                        Join Session
                      </a>
                    }
                    @if (session.status === 'COMPLETED' && reviewEligibility()?.[session.id]?.eligible && !hasReview(session.id)) {
                      <button type="button" class="btn-secondary btn-sm" (click)="openReviewDialog(session)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 6.91 8.26 12 2"/></svg>
                        Leave Review
                      </button>
                    }
                    @if (hasReview(session.id)) {
                      <span class="review-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 6.91 8.26 12 2"/></svg>
                        Reviewed
                      </span>
                    }
                  </div>
                </div>

                @if (session.status === 'COMPLETED' && studentReviews()[session.id]) {
                  <div class="review-preview">
                    <div class="review-header">
                      <ab-rating-display [value]="studentReviews()[session.id]!.rating" [showValue]="true" [showCount]="false" [readonly]="true" [size]="'sm'" />
                      <span class="review-date">{{ formatDate(studentReviews()[session.id]!.createdAt) }}</span>
                    </div>
                    <p class="review-comment">{{ studentReviews()[session.id]!.comment }}</p>
                  </div>
                }
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
    .sessions { padding: 1.5rem; }
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

    .sessions-list { display: flex; flex-direction: column; gap: 1rem; }
    .session-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .session-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border-color: #dee2e6; }
    .session-card.status-scheduled { border-left: 4px solid #1a73e8; }
    .session-card.status-in_progress { border-left: 4px solid #17a2b8; }
    .session-card.status-completed { border-left: 4px solid #28a745; }
    .session-card.status-cancelled { border-left: 4px solid #dc3545; }
    .session-card.status-no_show { border-left: 4px solid #6c757d; }

    .session-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem 1.5rem; gap: 1rem; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
    .mentor-info { display: flex; align-items: center; gap: 1rem; min-width: 0; flex: 1; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .mentor-name { display: block; font-weight: 600; color: #2c3e50; }
    .session-type { display: block; font-size: 0.8125rem; color: #6c757d; }
    .session-status { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; text-align: right; flex-shrink: 0; }

    .session-details { padding: 1.25rem 1.5rem; }
    .detail-row { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: #495057; margin-bottom: 0.75rem; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-row svg { color: #6c757d; flex-shrink: 0; }
    .timezone-badge { display: inline-block; padding: 0.125rem 0.5rem; font-size: 0.6875rem; font-weight: 600; background: #e7f3ff; color: #1a73e8; border-radius: 9999px; text-transform: uppercase; }
    .detail-row.notes { color: #6c757d; font-style: italic; }

    .session-footer { padding: 1rem 1.5rem; border-top: 1px solid #e9ecef; background: #f8f9fa; }
    .session-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-primary, .btn-secondary {
      display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; transition: all 0.2s ease; text-decoration: none;
    }
    .btn-primary { padding: 0.5rem 1rem; color: #fff; background: #2c3e50; }
    .btn-primary:hover { background: #1a252f; }
    .btn-secondary { padding: 0.5rem 1rem; color: #495057; background: #fff; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }

    .review-badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.75rem; font-size: 0.75rem; font-weight: 500; color: #28a745; background: #d4edda; border-radius: 9999px; }
    .review-badge svg { color: #28a745; }

    .review-preview { padding: 1rem 1.5rem; border-top: 1px solid #e9ecef; background: #f8f9fa; }
    .review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
    .review-date { font-size: 0.75rem; color: #6c757d; }
    .review-comment { margin: 0; font-size: 0.875rem; color: #495057; }

    @media (max-width: 768px) {
      .sessions { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .session-header { flex-direction: column; align-items: flex-start; }
      .session-status { align-items: flex-start; width: 100%; }
    }
  `]
})
export class StudentSessionsComponent implements OnInit {
  studentService = inject(StudentService);
  sessionService = inject(SessionService);
  reviewService = inject(ReviewService);
  toast = inject(ToastContainerComponent);

  sessions = signal<Session[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'>('ALL');
  reviewEligibility = signal<Record<string, ReviewEligibility>>({});
  studentReviews = signal<Record<string, Review>>({});

  showReviewDialog = signal(false);
  reviewDialogMessage = signal('');
  pendingReviewSession = signal<Session | null>(null);
  reviewData = { rating: 0, comment: '' };

  statusTabs = [
    { value: 'ALL', label: 'All' },
    { value: 'SCHEDULED', label: 'Upcoming' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' },
  ];

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading.set(true);
    this.error.set(null);
    const status = this.activeTab() === 'ALL' ? undefined : this.activeTab();
    this.sessionService.getStudentSessions({
      status: status ? [status] : undefined,
      page: this.currentPage() - 1,
      size: 10,
      sortBy: 'scheduledAt',
      sortDirection: 'desc',
    }).subscribe({
      next: (res: SessionPageResponse) => {
        this.sessions.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.number + 1);
        this.loading.set(false);
        this.checkReviewEligibility();
        this.loadStudentReviews();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load sessions');
        this.loading.set(false);
      }
    });
  }

  checkReviewEligibility(): void {
    this.sessions().filter(s => s.status === 'COMPLETED').forEach(session => {
      this.reviewService.checkEligibility(session.id).subscribe({
        next: (eligibility) => this.reviewEligibility.update(e => ({ ...e, [session.id]: eligibility })),
        error: () => this.reviewEligibility.update(e => ({ ...e, [session.id]: { eligible: false, sessionId: session.id } }))
      });
    });
  }

  loadStudentReviews(): void {
    this.reviewService.getStudentReviews({ page: 0, size: 50 }).subscribe({
      next: (res) => {
        const reviewsMap: Record<string, Review> = {};
        res.content.forEach(r => reviewsMap[r.sessionId] = r);
        this.studentReviews.set(reviewsMap);
      },
      error: () => {}
    });
  }

  setActiveTab(tab: 'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.loadSessions();
  }

  getTabCount(status: string): number {
    if (status === 'ALL') return this.totalElements();
    return this.sessions().filter(s => s.status === status).length;
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadSessions();
  }

  hasReview(sessionId: string): boolean {
    return !!this.studentReviews()[sessionId];
  }

  openReviewDialog(session: Session): void {
    this.pendingReviewSession.set(session);
    this.reviewData = { rating: 0, comment: '' };
    this.reviewDialogMessage.set(`Rate and review your ${session.sessionTypeName} session with ${session.mentor?.firstName} ${session.mentor?.lastName}`);
    this.showReviewDialog.set(true);
  }

  closeReviewDialog(): void {
    this.showReviewDialog.set(false);
    this.pendingReviewSession.set(null);
  }

  submitReview(): void {
    const session = this.pendingReviewSession();
    if (!session || this.reviewData.rating === 0) return;

    this.reviewService.createReview({
      sessionId: session.id,
      rating: this.reviewData.rating,
      comment: this.reviewData.comment.trim(),
    }).subscribe({
      next: () => {
        this.toast.success('Review Submitted', 'Thank you for your feedback!');
        this.closeReviewDialog();
        this.loadSessions();
      },
      error: (err) => this.toast.error('Review Failed', err.error?.message || 'Failed to submit review')
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDateTime(dateString: string, timezone: string): string {
    return new Date(dateString).toLocaleString(undefined, { 
      month: 'short', day: 'numeric', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short' 
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStatusVariant(status: string): 'success' | 'info' | 'warning' | 'danger' | 'default' {
    switch (status) { 
      case 'COMPLETED': return 'success'; 
      case 'SCHEDULED': return 'info'; 
      case 'IN_PROGRESS': return 'warning'; 
      case 'CANCELLED': return 'danger'; 
      default: return 'default'; 
    }
  }

  getEmptyTitle(): string {
    switch (this.activeTab()) {
      case 'SCHEDULED': return 'No Upcoming Sessions';
      case 'IN_PROGRESS': return 'No Active Sessions';
      case 'COMPLETED': return 'No Completed Sessions';
      case 'CANCELLED': return 'No Cancelled Sessions';
      case 'NO_SHOW': return 'No Missed Sessions';
      default: return 'No Sessions Yet';
    }
  }

  getEmptyMessage(): string {
    switch (this.activeTab()) {
      case 'SCHEDULED': return 'Book a session with your mentor to see it here.';
      case 'IN_PROGRESS': return 'Active sessions will appear here.';
      case 'COMPLETED': return 'Completed sessions will appear here. You can leave reviews for them.';
      case 'CANCELLED': return 'Cancelled sessions will appear here.';
      case 'NO_SHOW': return 'Missed sessions will appear here.';
      default: return 'Your session history will appear here once you start booking sessions.';
    }
  }
}