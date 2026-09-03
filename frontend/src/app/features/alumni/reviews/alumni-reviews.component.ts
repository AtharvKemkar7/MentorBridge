import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { Review, ReviewPageResponse, RatingSummary } from '../../../core/models/review.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { RatingDisplayComponent } from '../../../shared/components/rating-display/rating-display.component';

@Component({
  selector: 'ab-alumni-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent, RatingDisplayComponent],
  template: `
    <div class="reviews-page">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Reviews & Ratings</h1>
          <p class="page-subtitle">View reviews from your mentees</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="false" message="Loading reviews..." />
        </div>
      } @else if (error()) {
        <ab-error-state [message]="error()" (retry)="loadReviews()" />
      } @else {
        <!-- Rating Summary -->
        @if (ratingSummary()) {
          <section class="card rating-summary-card">
            <div class="section-content">
              <div class="rating-overview">
                <div class="main-rating">
                  <ab-rating-display [value]="ratingSummary()!.averageRating" [count]="ratingSummary()!.totalReviews" [showValue]="true" [showCount]="true" [readonly]="true" [size]="'xl'" />
                </div>
                <div class="rating-distribution">
                  @for (star of [5,4,3,2,1]; track star) {
                    <div class="distribution-row">
                      <span class="star-label">{{ star }} star</span>
                      <div class="distribution-bar">
                        <div class="distribution-fill" [style.width.%]="getDistributionPercent(star)"></div>
                      </div>
                      <span class="star-count">{{ ratingSummary()!.distribution[star] || 0 }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>
        }

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
                  <div class="student-info">
                    <div class="avatar" [style.background-image]="review.student?.avatarUrl ? 'url(' + review.student!.avatarUrl + ')' : ''">
                      @if (!review.student?.avatarUrl) {
                        {{ getInitials(review.student?.firstName + ' ' + review.student?.lastName) }}
                      }
                    </div>
                    <div>
                      <span class="student-name">{{ review.student?.firstName }} {{ review.student?.lastName }}</span>
                      <span class="student-role">Student</span>
                    </div>
                  </div>
                  <p class="review-comment">{{ review.comment }}</p>
                </div>

                <div class="review-footer">
                  <div class="review-meta">
                    <span class="meta-item">Submitted: {{ formatDate(review.createdAt) }}</span>
                    @if (review.updatedAt && review.updatedAt !== review.createdAt) {
                      <span class="meta-item">Updated: {{ formatDate(review.updatedAt) }}</span>
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
            message="Reviews from your mentees will appear here after completed sessions."
            actionLabel="View Sessions"
            actionRoute="/alumni/sessions"
            [centered]="true"
          />
        }
      }
    </div>
  `,
  styles: [`
    .reviews-page { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .loading-container { display: flex; justify-content: center; padding: 3rem; }

    .rating-summary-card { margin-bottom: 1.5rem; }
    .rating-overview { display: grid; grid-template-columns: 200px 1fr; gap: 2rem; align-items: start; }
    .main-rating { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .rating-distribution { display: flex; flex-direction: column; gap: 0.5rem; }
    .distribution-row { display: flex; align-items: center; gap: 0.75rem; }
    .star-label { width: 60px; font-size: 0.8125rem; color: #6c757d; }
    .distribution-bar { flex: 1; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; }
    .distribution-fill { height: 100%; background: #ffc107; border-radius: 4px; transition: width 0.3s ease; }
    .star-count { width: 40px; text-align: right; font-size: 0.8125rem; color: #6c757d; font-variant-numeric: tabular-nums; }

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
    .student-info { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .student-name { display: block; font-weight: 500; color: #2c3e50; }
    .student-role { display: block; font-size: 0.8125rem; color: #6c757d; }
    .review-comment { margin: 0; font-size: 0.9375rem; line-height: 1.6; color: #495057; }

    .review-footer { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-top: 1px solid #e9ecef; background: #f8f9fa; flex-wrap: wrap; gap: 0.5rem; }
    .review-meta { display: flex; gap: 1rem; }
    .meta-item { font-size: 0.8125rem; color: #6c757d; }

    @media (max-width: 768px) {
      .reviews-page { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .rating-overview { grid-template-columns: 1fr; }
      .review-header { flex-direction: column; align-items: flex-start; }
      .review-status { width: 100%; justify-content: space-between; }
    }
  `]
})
export class AlumniReviewsComponent implements OnInit {
  reviewService = inject(ReviewService);

  reviews = signal<Review[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);
  ratingSummary = signal<RatingSummary | null>(null);

  ngOnInit(): void {
    this.loadReviews();
    this.loadRatingSummary();
  }

  loadReviews(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reviewService.getAlumniReviews({
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

  loadRatingSummary(): void {
    this.reviewService.getRatingSummary('').subscribe({
      next: (summary) => this.ratingSummary.set(summary),
      error: () => {}
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadReviews();
  }

  getDistributionPercent(star: number): number {
    const total = this.ratingSummary()?.totalReviews || 1;
    return ((this.ratingSummary()?.distribution[star] || 0) / total) * 100;
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