import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule, FormsModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { NotificationItemComponent } from '../../../shared/components/notification-item/notification-item.component';

@Component({
  selector: 'ab-alumni-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, NotificationItemComponent],
  template: `
    <div class="notifications">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Notifications</h1>
          <p class="page-subtitle">Stay updated on your mentorship activity</p>
        </div>
        <div class="header-actions">
          @if (unreadCount() > 0) {
            <button type="button" class="btn-primary" (click)="markAllAsRead()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Mark All as Read
            </button>
          }
        </div>
      </header>

      @if (loading() && notifications().length === 0) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="false" message="Loading notifications..." />
        </div>
      } @else if (error()) {
        <ab-error-state [message]="error()" (retry)="loadNotifications()" />
      } @else {
        <div class="notifications-header">
          <div class="unread-summary" [class.has-unread]="unreadCount() > 0">
            @if (unreadCount() > 0) {
              <span class="unread-badge">{{ unreadCount() }}</span>
              <span>unread notification{{ unreadCount() !== 1 ? 's' : '' }}</span>
            } @else {
              <span class="all-read">All caught up!</span>
            }
          </div>
          <div class="filter-controls">
            <select class="filter-select" [(ngModel)]="filterRead" (ngModelChange)="onFilterChange()">
              <option value="">All Notifications</option>
              <option value="true">Read Only</option>
              <option value="false">Unread Only</option>
            </select>
          </div>
        </div>

        @if (notifications().length) {
          <div class="notifications-list">
            @for (notification of notifications(); track notification.id) {
              <ab-notification-item 
                [notification]="notification" 
                [actionRoute]="getActionRoute(notification)"
                (markRead)="markAsRead($event)"
              />
            }
          </div>

          @if (hasMorePages()) {
            <div class="load-more-container">
              <button type="button" class="btn-load-more" (click)="loadMore()" [disabled]="loading()">
                @if (loading()) {
                  <ab-loading-spinner [size]="18" [inline]="true" />
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 20 23 14 17 14"/><polyline points="1 4 1 10 7 10"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  Load More
                }
              </button>
            </div>
          }
        } @else {
          <ab-empty-state
            title="No Notifications"
            message="You're all caught up! New notifications will appear here."
            [centered]="true"
          />
        }
      }
    </div>
  `,
  styles: [`
    .notifications { padding: 1.5rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .header-actions { display: flex; gap: 0.75rem; }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 500; color: #fff; background: #2c3e50; border: none; border-radius: 0.375rem; cursor: pointer; transition: background 0.2s ease; }
    .btn-primary:hover { background: #1a252f; }

    .loading-container { display: flex; justify-content: center; padding: 3rem; }

    .notifications-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .unread-summary { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6c757d; }
    .unread-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 0.75rem; font-size: 0.8125rem; font-weight: 600; color: #fff; background: #dc3545; border-radius: 9999px; }
    .all-read { color: #28a745; font-weight: 500; }
    .filter-controls { display: flex; gap: 0.5rem; }
    .filter-select { padding: 0.5rem 2rem 0.5rem 0.875rem; font-size: 0.875rem; color: #2c3e50; background: #fff; border: 1px solid #dee2e6; border-radius: 0.375rem; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; }
    .filter-select:focus { outline: none; border-color: #2c3e50; box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.15); }

    .notifications-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .load-more-container { display: flex; justify-content: center; margin-top: 1.5rem; }
    .btn-load-more { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-size: 0.875rem; font-weight: 500; color: #2c3e50; background: #fff; border: 1px solid #dee2e6; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s ease; }
    .btn-load-more:hover:not(:disabled) { background: #f8f9fa; border-color: #ced4da; }
    .btn-load-more:disabled { opacity: 0.7; cursor: not-allowed; }

    @media (max-width: 768px) {
      .notifications { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .notifications-header { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class AlumniNotificationsComponent implements OnInit {
  notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  loading = this.notificationService.isLoading;
  totalPages = this.notificationService.totalPages;
  currentPage = this.notificationService.currentPage;
  totalElements = this.notificationService.totalElements;

  filterRead = '';
  error = signal<string | null>(null);

  hasMorePages = computed(() => this.currentPage() < this.totalPages());

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.error.set(null);
    this.notificationService.loadNotifications({ read: this.filterRead || undefined }).subscribe({
      error: (err) => this.error.set(err.error?.message || 'Failed to load notifications')
    });
  }

  loadMore(): void {
    this.notificationService.loadMore({ read: this.filterRead || undefined }).subscribe({
      error: (err) => this.error.set(err.error?.message || 'Failed to load more notifications')
    });
  }

  onFilterChange(): void {
    this.notificationService.notifications.set([]);
    this.notificationService.totalPages.set(0);
    this.notificationService.currentPage.set(1);
    this.loadNotifications();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      error: (err) => this.error.set(err.error?.message || 'Failed to mark all as read')
    });
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead([notificationId]).subscribe({
      error: (err) => this.error.set(err.error?.message || 'Failed to mark as read')
    });
  }

  getActionRoute(notification: Notification): string {
    const data = notification.data;
    if (!data) return '';
    
    if (data.mentorshipRequestId) return `/alumni/requests`;
    if (data.mentorshipId) return `/alumni/mentorships`;
    if (data.bookingId) return `/alumni/bookings`;
    if (data.sessionId) return `/alumni/sessions`;
    if (data.reviewId) return `/alumni/reviews`;
    
    return '';
  }
}