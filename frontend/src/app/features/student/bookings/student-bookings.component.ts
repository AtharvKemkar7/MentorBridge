import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingFilters, BookingPageResponse, AvailableSlot } from '../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';
import { RescheduleBookingDto, CancelBookingDto } from '../../../core/models/booking.model';

@Component({
  selector: 'ab-student-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent, ConfirmDialogComponent, ToastContainerComponent],
  template: `
    <div class="bookings">
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
          <h1 class="page-title">My Bookings</h1>
          <p class="page-subtitle">Manage your mentorship session bookings</p>
        </div>
        <a routerLink="/student/alumni" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          Book New Session
        </a>
      </header>

      @if (loading()) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="false" message="Loading bookings..." />
        </div>
      } @else if (error()) {
        <ab-error-state [message]="error()" (retry)="loadBookings()" />
      } @else {
        <!-- Filter Tabs -->
        <nav class="filter-tabs" aria-label="Filter bookings by status">
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

        @if (bookings().length) {
          <div class="bookings-list">
            @for (booking of bookings(); track booking.id) {
              <article class="booking-card" [class]="'status-' + booking.status.toLowerCase()">
                <div class="booking-header">
                  <div class="mentor-info">
                    <div class="avatar" [style.background-image]="booking.mentor?.avatarUrl ? 'url(' + booking.mentor!.avatarUrl + ')' : ''">
                      @if (!booking.mentor?.avatarUrl) {
                        {{ getInitials(booking.mentor?.firstName + ' ' + booking.mentor?.lastName) }}
                      }
                    </div>
                    <div class="mentor-details">
                      <span class="mentor-name">{{ booking.mentor?.firstName }} {{ booking.mentor?.lastName }}</span>
                      <span class="session-type">{{ booking.sessionTypeName }}</span>
                    </div>
                  </div>
                  <div class="booking-status">
                    <ab-status-badge [label]="booking.status" [variant]="getStatusVariant(booking.status)" [dot]="true" />
                  </div>
                </div>

                <div class="booking-details">
                  <div class="detail-row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>{{ formatDateTime(booking.scheduledAt, booking.timezone) }}</span>
                    <span class="timezone-badge">{{ booking.timezone }}</span>
                  </div>
                  <div class="detail-row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>{{ booking.durationMinutes }} minutes</span>
                  </div>
                  @if (booking.notes) {
                    <div class="detail-row notes">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span>{{ booking.notes }}</span>
                    </div>
                  }
                  @if (booking.cancellationReason) {
                    <div class="detail-row cancelled">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <span>Cancelled: {{ booking.cancellationReason }}</span>
                    </div>
                  }
                </div>

                <div class="booking-footer">
                  <div class="booking-actions">
                    @if (booking.status === 'PENDING' || booking.status === 'CONFIRMED') {
                      <button type="button" class="btn-secondary btn-sm" (click)="openRescheduleDialog(booking)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                        Reschedule
                      </button>
                      <button type="button" class="btn-danger btn-sm" (click)="openCancelDialog(booking)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        Cancel
                      </button>
                    }
                    @if (booking.meetingLink && (booking.status === 'CONFIRMED' || booking.status === 'PENDING')) {
                      <a [href]="booking.meetingLink" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                        Join Session
                      </a>
                    }
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
            [actionLabel]="activeTab() !== 'CANCELLED' ? 'Book a Session' : ''"
            [actionRoute]="activeTab() !== 'CANCELLED' ? '/student/alumni' : ''"
            [centered]="true"
          />
        }
      }
    </div>
  `,
  styles: [`
    .bookings { padding: 1.5rem; }
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

    .bookings-list { display: flex; flex-direction: column; gap: 1rem; }
    .booking-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .booking-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border-color: #dee2e6; }
    .booking-card.status-pending { border-left: 4px solid #ffc107; }
    .booking-card.status-confirmed { border-left: 4px solid #28a745; }
    .booking-card.status-cancelled { border-left: 4px solid #dc3545; }
    .booking-card.status-completed { border-left: 4px solid #6c757d; }
    .booking-card.status-rescheduled { border-left: 4px solid #17a2b8; }

    .booking-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem 1.5rem; gap: 1rem; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
    .mentor-info { display: flex; align-items: center; gap: 1rem; min-width: 0; flex: 1; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .mentor-name { display: block; font-weight: 600; color: #2c3e50; }
    .session-type { display: block; font-size: 0.8125rem; color: #6c757d; }
    .booking-status { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; text-align: right; flex-shrink: 0; }

    .booking-details { padding: 1.25rem 1.5rem; }
    .detail-row { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: #495057; margin-bottom: 0.75rem; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-row svg { color: #6c757d; flex-shrink: 0; }
    .timezone-badge { display: inline-block; padding: 0.125rem 0.5rem; font-size: 0.6875rem; font-weight: 600; background: #e7f3ff; color: #1a73e8; border-radius: 9999px; text-transform: uppercase; }
    .detail-row.notes { color: #6c757d; font-style: italic; }
    .detail-row.cancelled { color: #dc3545; }

    .booking-footer { padding: 1rem 1.5rem; border-top: 1px solid #e9ecef; background: #f8f9fa; }
    .booking-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    @media (max-width: 768px) {
      .bookings { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .booking-header { flex-direction: column; align-items: flex-start; }
      .booking-status { align-items: flex-start; width: 100%; }
    }
  `]
})
export class StudentBookingsComponent implements OnInit {
  studentService = inject(StudentService);
  bookingService = inject(BookingService);
  toast = inject(ToastContainerComponent);

  bookings = signal<Booking[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED'>('ALL');

  showConfirmDialog = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmLabel = signal('');
  confirmVariant = signal<'danger' | 'primary'>('danger');
  confirmActionFn = signal<() => void>(() => {});
  pendingBooking = signal<Booking | null>(null);
  rescheduleData = { newDate: '', reason: '' };

  statusTabs = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'RESCHEDULED', label: 'Rescheduled' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.error.set(null);
    const status = this.activeTab() === 'ALL' ? undefined : this.activeTab();
    this.bookingService.getStudentBookings({
      status: status ? [status] : undefined,
      page: this.currentPage() - 1,
      size: 10,
      sortBy: 'scheduledAt',
      sortDirection: 'desc',
    }).subscribe({
      next: (res: BookingPageResponse) => {
        this.bookings.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.number + 1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load bookings');
        this.loading.set(false);
      }
    });
  }

  setActiveTab(tab: 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED'): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.loadBookings();
  }

  getTabCount(status: string): number {
    if (status === 'ALL') return this.totalElements();
    return this.bookings().filter(b => b.status === status).length;
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadBookings();
  }

  openRescheduleDialog(booking: Booking): void {
    this.pendingBooking.set(booking);
    this.rescheduleData = { newDate: '', reason: '' };
    this.confirmTitle.set('Reschedule Booking');
    this.confirmMessage.set(`Reschedule your ${booking.sessionTypeName} session with ${booking.mentor?.firstName} ${booking.mentor?.lastName}?`);
    this.confirmLabel.set('Reschedule');
    this.confirmVariant.set('primary');
    this.confirmActionFn.set(() => this.rescheduleBooking());
    this.showConfirmDialog.set(true);
  }

  openCancelDialog(booking: Booking): void {
    this.pendingBooking.set(booking);
    this.confirmTitle.set('Cancel Booking');
    this.confirmMessage.set(`Are you sure you want to cancel your ${booking.sessionTypeName} session with ${booking.mentor?.firstName} ${booking.mentor?.lastName}?`);
    this.confirmLabel.set('Cancel Booking');
    this.confirmVariant.set('danger');
    this.confirmActionFn.set(() => this.cancelBooking());
    this.showConfirmDialog.set(true);
  }

  confirmAction(): void {
    this.confirmActionFn()();
    this.showConfirmDialog.set(false);
    this.pendingBooking.set(null);
  }

  rescheduleBooking(): void {
    const booking = this.pendingBooking();
    if (!booking || !this.rescheduleData.newDate) return;

    const payload: RescheduleBookingDto = {
      bookingId: booking.id,
      newScheduledAt: this.rescheduleData.newDate,
      timezone: booking.timezone,
      reason: this.rescheduleData.reason,
    };

    this.bookingService.rescheduleBooking(payload).subscribe({
      next: () => {
        this.toast.success('Booking Rescheduled', 'Your session has been rescheduled successfully.');
        this.loadBookings();
      },
      error: (err) => this.toast.error('Reschedule Failed', err.error?.message || 'Failed to reschedule booking')
    });
  }

  cancelBooking(): void {
    const booking = this.pendingBooking();
    if (!booking) return;

    const payload: CancelBookingDto = {
      bookingId: booking.id,
      reason: 'Cancelled by student',
    };

    this.bookingService.cancelBooking(payload).subscribe({
      next: () => {
        this.toast.success('Booking Cancelled', 'Your session has been cancelled.');
        this.loadBookings();
      },
      error: (err) => this.toast.error('Cancel Failed', err.error?.message || 'Failed to cancel booking')
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

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    switch (status) { 
      case 'CONFIRMED': return 'success'; 
      case 'COMPLETED': return 'default'; 
      case 'PENDING': return 'warning'; 
      case 'RESCHEDULED': return 'info'; 
      case 'CANCELLED': return 'danger'; 
      default: return 'default'; 
    }
  }

  getEmptyTitle(): string {
    switch (this.activeTab()) {
      case 'PENDING': return 'No Pending Bookings';
      case 'CONFIRMED': return 'No Confirmed Bookings';
      case 'COMPLETED': return 'No Completed Bookings';
      case 'CANCELLED': return 'No Cancelled Bookings';
      case 'RESCHEDULED': return 'No Rescheduled Bookings';
      default: return 'No Bookings Yet';
    }
  }

  getEmptyMessage(): string {
    switch (this.activeTab()) {
      case 'PENDING': return 'Pending booking confirmations will appear here.';
      case 'CONFIRMED': return 'Your confirmed sessions will appear here.';
      case 'COMPLETED': return 'Completed sessions will appear here.';
      case 'CANCELLED': return 'Cancelled bookings will appear here.';
      case 'RESCHEDULED': return 'Rescheduled bookings will appear here.';
      default: return 'Book a session with an alumni mentor to get started.';
    }
  }
}