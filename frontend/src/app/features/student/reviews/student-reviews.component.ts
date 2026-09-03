import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { Review, ReviewPageResponse } from '../../../core/models/review.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { RatingDisplayComponent } from '../../../shared/components/rating-display/rating-display.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ab-student-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent, RatingDisplayComponent, ConfirmDialogComponent, ToastContainerComponent],
  template: `
    <div class="reviews">
      <ab-toast-container />
      <ab-confirm-dialog
        [open]="showEditDialog()"
        [title]="editDialogTitle()"
        [message]="editDialogMessage()"
        [confirmLabel]="'Save Changes'"
        [cancelLabel]="'Cancel'"
        (confirm)="saveEdit()"
        (cancel)="closeEditDialog()"
      />
      <ab-confirm-dialog
        [open]="showDeleteDialog()"
        [title]="'Delete Review'"
        [message]="'Are you sure you want to delete this review? This action cannot be undone.'"
        [confirmLabel]="'Delete'"
        [cancelLabel]="'Cancel'"
        [variant]="'danger'"
        (confirm)="confirmDelete()"
        (cancel)="closeDeleteDialog()"
      />

      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">My Reviews</h1>
          <p class="page-subtitle">View and manage your submitted reviews</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="false" message="Loading reviews..." />
        </div>
      } @else if (error()) {
        <ab-error-state [message]="error()" (retry)="loadReviews()" />
      } @else {
        @if (reviews().length) {
          <div class="reviews-list">
            @for (review of reviews(); track review.id) {
              <article class="review-card" [class]="'status-' + review.status.toLowerCase()">
                <div class="review-header">
                  <div class="session-info">
                    <h3 class="session-type">{{ review.session?.sessionType || 'Session' }}</h3>
                    <span class="session-date">{{ formatDate(review.session?.scheduledAt) }}</span>
                  </div>
                  <div class="review-status">
                    <ab-status-badge [label]="review.status" [variant]="getStatusVariant(review.status)" />
                    <ab-rating-display [value]="review.rating" [showValue]="true" [showCount]="false" [readonly]="true" [size]="'sm'" />
                  </div>
                </div>

                <div class="review-content">
                  <div class="mentor-info">
                    <div class="avatar" [style.background-image]="review.mentor?.avatarUrl ? 'url(' + review.mentor!.avatarUrl + ')' : ''">
                      @if (!review.mentor?.avatarUrl) {
                        {{ getInitials(review.mentor?.firstName + ' ' + review.mentor?.lastName) }}
                      }
                    </div>
                    <div>
                      <span class="mentor-name">{{ review.mentor?.firstName }} {{ review.mentor?.lastName }}</span>
                      <span class="mentor-role">{{ review.mentor?.currentRole || 'Alumni' }}</span>
                    </div>
                  </div>
                  <p class="review-comment">{{ review.comment }}</p>
                </div>

                <div class="review-footer">
                  <div class="review-meta">
                    <span class="meta-item">Submitted: {{ formatDate(review.createdAt) }}</span>
                    @if (review.updatedAt && review.updatedAt !== review.createdAt) {
                      <span class="meta-item">Edited: {{ formatDate(review.updatedAt) }}</span>
                    }
                  </div>
                  <div class="review-actions">
                    @if (review.status === 'PUBLISHED' || review.status === 'PENDING_MODERATION') {
                      <button type="button" class="btn-secondary btn-sm" (click)="openEditDialog(review)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button type="button" class="btn-danger btn-sm" (click)="openDeleteDialog(review)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Delete
                      </button>
                    }
                  </div>
                </div>
              </article>
            }
          </div>

          <ab-pagination [currentPage]="currentPage()" [totalPages]="totalPages()" [totalElements]="totalElements()" (pageChange)="onPageChange($event)" />
        } @else {
          <ab-empty-state
            title="No Reviews Yet"
            message="Your submitted reviews will appear here after you complete mentorship sessions."
            actionLabel="View Sessions"
            actionRoute="/student/sessions"
            [centered]="true"
          />
        }
      }
    </div>
  `,
  styles: [`
    .reviews { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }

    .loading-container { display: flex; justify-content: center; padding: 3rem; }

    .reviews-list { display: flex; flex-direction: column; gap: 1rem; }
    .review-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .review-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border-color: #dee2e6; }
    .review-card.status-published { border-left: 4px solid #28a745; }
    .review-card.status-pending_moderation { border-left: 4px solid #ffc107; }
    .review-card.status-rejected { border-left: 4px solid #dc3545; }
    .review-card.status-hidden { border-left: 4px solid #6c757d; }

    .review-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; gap: 1rem; background: #f8f9fa; border-bottom: 1px solid #e9ecef; flex-wrap: wrap; }
    .session-type { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .session-date { display: block; font-size: 0.8125rem; color: #6c757d; }
    .review-status { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

    .review-content { padding: 1.25rem 1.5rem; }
    .mentor-info { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .mentor-name { display: block; font-weight: 500; color: #2c3e50; }
    .mentor-role { display: block; font-size: 0.8125rem; color: #6c757d; }
    .review-comment { margin: 0; font-size: 0.9375rem; line-height: 1.6; color: #495057; }

    .review-footer { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-top: 1px solid #e9ecef; background: #f8f9fa; flex-wrap: wrap; gap: 0.5rem; }
    .review-meta { display: flex; gap: 1rem; }
    .meta-item { font-size: 0.8125rem; color: #6c757d; }
    .review-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-secondary, .btn-danger {
      display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; transition: all 0.2s ease; text-decoration: none;
    }
    .btn-secondary { padding: 0.5rem 1rem; color: #495057; background: #fff; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    .btn-danger { padding: 0.5rem 1rem; color: #fff; background: #dc3545; }
    .btn-danger:hover { background: #c82333; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }

    @media (max-width: 768px) {
      .reviews { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .review-header { flex-direction: column; align-items: flex-start; }
      .review-status { width: 100%; justify-content: space-between; }
    }
  `]
})
export class StudentReviewsComponent implements OnInit {
  reviewService = inject(ReviewService);
  toast = inject(ToastContainerComponent);

  reviews = signal<Review[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);

  showEditDialog = signal(false);
  editDialogTitle = signal('');
  editDialogMessage = signal('');
  pendingEditReview = signal<Review | null>(null);
  editData = { rating: 0, comment: '' };

  showDeleteDialog = signal(false);
  pendingDeleteReview = signal<Review | null>(null);

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reviewService.getStudentReviews({
      page: this.currentPage() - 1,
      size: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    }).subscribe({
      next: (res: ReviewPageResponse) => {
        this.reviews.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.number + 1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load reviews');
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadReviews();
  }

  openEditDialog(review: Review): void {
    this.pendingEditReview.set(review);
    this.editData = { rating: review.rating, comment: review.comment };
    this.editDialogTitle.set('Edit Review');
    this.editDialogMessage.set(`Update your review for ${review.mentor?.firstName} ${review.mentor?.lastName}`);
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.pendingEditReview.set(null);
  }

  saveEdit(): void {
    const review = this.pendingEditReview();
    if (!review || this.editData.rating === 0) return;

    this.reviewService.updateReview(review.id, this.editData).subscribe({
      next: () => {
        this.toast.success('Review Updated', 'Your review has been updated successfully.');
        this.closeEditDialog();
        this.loadReviews();
      },
      error: (err) => this.toast.error('Update Failed', err.error?.message || 'Failed to update review')
    });
  }

  openDeleteDialog(review: Review): void {
    this.pendingDeleteReview.set(review);
    this.showDeleteDialog.set(true);
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
    this.pendingDeleteReview.set(null);
  }

  confirmDelete(): void {
    const review = this.pendingDeleteReview();
    if (!review) return;

    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        this.toast.success('Review Deleted', 'Your review has been deleted.');
        this.closeDeleteDialog();
        this.loadReviews();
      },
      error: (err) => this.toast.error('Delete Failed', err.error?.message || 'Failed to delete review')
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    switch (status) { case 'PUBLISHED': return 'success'; case 'PENDING_MODERATION': return 'warning'; case 'REJECTED': return 'danger'; default: return 'default'; }
  }
}