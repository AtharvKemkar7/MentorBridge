import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Notification, NOTIFICATION_TYPE_ICONS, NOTIFICATION_TYPE_LABELS } from '../../../core/models/notification.model';

@Component({
  selector: 'ab-notification-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="notification-item" [class.unread]="!notification().read" [class.read]="notification().read">
      <div class="notification-icon" [innerHTML]="icon()" [class]="'type-' + notification().type"></div>
      <div class="notification-content">
        <header class="notification-header">
          <h4 class="notification-title">{{ getTitle() }}</h4>
          <time class="notification-time" [dateTime]="notification().createdAt">{{ formatDate(notification().createdAt) }}</time>
        </header>
        <p class="notification-message">{{ notification().message }}</p>
        @if (notification().data && showData()) {
          <div class="notification-data" [innerHTML]="formatData()"></div>
        }
      </div>
      <div class="notification-actions">
        @if (!notification().read) {
          <button type="button" class="btn-mark-read" (click)="markRead.emit(notification().id)" aria-label="Mark as read">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        }
        @if (actionRoute()) {
          <a [routerLink]="actionRoute()" class="btn-view" [attr.aria-label]="'View ' + getTitle()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        }
      </div>
    </article>
  `,
  styles: [`
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 0.5rem;
      transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .notification-item:hover {
      background: #f8f9fa;
      border-color: #dee2e6;
    }
    .notification-item.unread {
      background: #f8f9fc;
      border-color: #d6eaff;
      box-shadow: 0 0 0 1px #d6eaff;
    }
    .notification-item.unread .notification-title { font-weight: 600; }
    .notification-icon {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 0.375rem;
      margin-top: 0.125rem;
    }
    .notification-icon svg { width: 20px; height: 20px; }
    .type-MENTORSHIP_REQUEST_RECEIVED { background: #e7f3ff; color: #1a73e8; }
    .type-MENTORSHIP_REQUEST_ACCEPTED { background: #e7f8ef; color: #28a745; }
    .type-MENTORSHIP_REQUEST_REJECTED { background: #fdeeee; color: #dc3545; }
    .type-MENTORSHIP_REQUEST_CANCELLED { background: #f1f3f5; color: #6c757d; }
    .type-MENTORSHIP_STARTED { background: #e7f3ff; color: #1a73e8; }
    .type-MENTORSHIP_PAUSED { background: #fff9e6; color: #f0ad4e; }
    .type-MENTORSHIP_RESUMED { background: #e7f3ff; color: #1a73e8; }
    .type-MENTORSHIP_ENDED { background: #f1f3f5; color: #6c757d; }
    .type-BOOKING_CREATED { background: #e7f8ef; color: #28a745; }
    .type-BOOKING_CONFIRMED { background: #e7f8ef; color: #28a745; }
    .type-BOOKING_CANCELLED { background: #fdeeee; color: #dc3545; }
    .type-BOOKING_RESCHEDULED { background: #fff9e6; color: #f0ad4e; }
    .type-BOOKING_REMINDER { background: #e7f3ff; color: #1a73e8; }
    .type-SESSION_STARTED { background: #e7f3ff; color: #1a73e8; }
    .type-SESSION_COMPLETED { background: #e7f8ef; color: #28a745; }
    .type-SESSION_CANCELLED { background: #fdeeee; color: #dc3545; }
    .type-SESSION_REMINDER { background: #e7f3ff; color: #1a73e8; }
    .type-REVIEW_RECEIVED { background: #fff9e6; color: #f0ad4e; }
    .type-REVIEW_PUBLISHED { background: #e7f8ef; color: #28a745; }
    .type-PROFILE_VERIFIED { background: #e7f8ef; color: #28a745; }
    .type-SYSTEM_ANNOUNCEMENT { background: #e7f3ff; color: #1a73e8; }
    
    .notification-content { flex: 1; min-width: 0; }
    .notification-header { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: 0.375rem; }
    .notification-title { margin: 0; font-size: 0.9375rem; color: #2c3e50; }
    .notification-time { font-size: 0.75rem; color: #6c757d; white-space: nowrap; flex-shrink: 0; }
    .notification-message { margin: 0 0 0.5rem; font-size: 0.875rem; line-height: 1.5; color: #495057; }
    .notification-data { font-size: 0.8125rem; color: #6c757d; }
    
    .notification-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0; }
    .btn-mark-read, .btn-view {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 0.375rem;
      color: #6c757d;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .btn-mark-read:hover { background: #e7f8ef; color: #28a745; }
    .btn-view:hover { background: #e7f3ff; color: #1a73e8; }
    .btn-view { text-decoration: none; }
  `]
})
export class NotificationItemComponent {
  notification = input.required<Notification>();
  actionRoute = input<string>('');
  showData = input(false);

  markRead = output<string>();

  icon = computed(() => NOTIFICATION_TYPE_ICONS[this.notification().type] || NOTIFICATION_TYPE_ICONS['SYSTEM_ANNOUNCEMENT']);

  getTitle(): string {
    return NOTIFICATION_TYPE_LABELS[this.notification().type] || this.notification().title;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatData(): string {
    const data = this.notification().data;
    if (!data) return '';
    const parts: string[] = [];
    if (data.mentorshipRequestId) parts.push(`Request: ${data.mentorshipRequestId}`);
    if (data.mentorshipId) parts.push(`Mentorship: ${data.mentorshipId}`);
    if (data.bookingId) parts.push(`Booking: ${data.bookingId}`);
    if (data.sessionId) parts.push(`Session: ${data.sessionId}`);
    if (data.reviewId) parts.push(`Review: ${data.reviewId}`);
    if (data.userId) parts.push(`User: ${data.userId}`);
    return parts.join(' • ');
  }
}