import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlumniService } from '../../../core/services/alumni.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { RatingDisplayComponent } from '../../../shared/components/rating-display/rating-display.component';
import { AlumniDashboardData, MentorshipRequestSummary, MenteeSummary, SessionSummary, AvailabilitySummary, RatingSummary } from '../../../core/models/alumni.model';

@Component({
  selector: 'ab-alumni-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, RatingDisplayComponent],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back, {{ alumniService.profile()?.firstName }}!</p>
        </div>
        <div class="header-actions">
          <ab-loading-spinner *ngIf="alumniService.isLoading()" [size]="24" [overlay]="false" />
        </div>
      </header>

      @if (alumniService.error()) {
        <ab-error-state [message]="alumniService.error()!" (retry)="loadDashboard()" />
      } @else {
        <div class="dashboard-grid">
          <!-- Pending Requests -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Pending Mentorship Requests</h2>
              <a routerLink="/alumni/requests" class="section-link">View All</a>
            </header>
            <div class="section-content">
              @if (pendingRequests().length) {
                <div class="request-list">
                  @for (request of pendingRequests().slice(0, 3); track request.id) {
                    <div class="request-item">
                      <div class="request-info">
                        <div class="avatar-sm" [style.background-image]="request.studentAvatarUrl ? 'url(' + request.studentAvatarUrl + ')' : ''">
                          @if (!request.studentAvatarUrl) {
                            {{ getInitials(request.studentName) }}
                          }
                        </div>
                        <div>
                          <span class="student-name">{{ request.studentName }}</span>
                          <span class="student-meta">{{ request.studentMajor || 'Student' }}{{ request.studentGraduationYear ? ' • Class of ' + request.studentGraduationYear : '' }}</span>
                        </div>
                      </div>
                      <div class="request-meta">
                        <ab-status-badge [label]="request.category" [variant]="'primary'" />
                        <span class="date">{{ formatDate(request.requestedAt) }}</span>
                      </div>
                    </div>
                  }
                  @if (pendingRequests().length > 3) {
                    <a routerLink="/alumni/requests" class="view-more">+{{ pendingRequests().length - 3 }} more</a>
                  }
                </div>
              } @else {
                <ab-empty-state title="No Pending Requests" message="New mentorship requests will appear here." />
              }
            </div>
          </section>

          <!-- Active Mentees -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Active Mentees</h2>
              <a routerLink="/alumni/mentorships" class="section-link">View All</a>
            </header>
            <div class="section-content">
              @if (activeMentees().length) {
                <div class="mentee-list">
                  @for (mentee of activeMentees().slice(0, 3); track mentee.id) {
                    <div class="mentee-item">
                      <div class="mentee-info">
                        <div class="avatar-sm" [style.background-image]="mentee.studentAvatarUrl ? 'url(' + mentee.studentAvatarUrl + ')' : ''">
                          @if (!mentee.studentAvatarUrl) {
                            {{ getInitials(mentee.studentName) }}
                          }
                        </div>
                        <div>
                          <span class="student-name">{{ mentee.studentName }}</span>
                          <span class="student-meta">{{ mentee.studentMajor || 'Student' }}{{ mentee.studentGraduationYear ? ' • Class of ' + mentee.studentGraduationYear : '' }}</span>
                        </div>
                      </div>
                      <div class="mentee-meta">
                        <span class="category">{{ mentee.category }}</span>
                        @if (mentee.nextSessionDate) {
                          <span class="next-session">Next: {{ formatDate(mentee.nextSessionDate) }}</span>
                        }
                      </div>
                    </div>
                  }
                  @if (activeMentees().length > 3) {
                    <a routerLink="/alumni/mentorships" class="view-more">+{{ activeMentees().length - 3 }} more</a>
                  }
                </div>
              } @else {
                <ab-empty-state title="No Active Mentees" message="Accept mentorship requests to start mentoring students." />
              }
            </div>
          </section>

          <!-- Upcoming Sessions -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Upcoming Sessions</h2>
              <a routerLink="/alumni/sessions" class="section-link">View All</a>
            </header>
            <div class="section-content">
              @if (upcomingSessions().length) {
                <div class="session-list">
                  @for (session of upcomingSessions().slice(0, 3); track session.id) {
                    <div class="session-item">
                      <div class="session-info">
                        <div class="avatar-sm" [style.background-image]="session.studentAvatarUrl ? 'url(' + session.studentAvatarUrl + ')' : ''">
                          @if (!session.studentAvatarUrl) {
                            {{ getInitials(session.studentName) }}
                          }
                        </div>
                        <div>
                          <span class="student-name">{{ session.studentName }}</span>
                          <span class="session-type">{{ session.type }}</span>
                        </div>
                      </div>
                      <div class="session-meta">
                        <ab-status-badge [label]="session.status" [variant]="getSessionStatusVariant(session.status)" />
                        <span class="session-time">{{ formatDateTime(session.scheduledAt) }}</span>
                      </div>
                    </div>
                  }
                  @if (upcomingSessions().length > 3) {
                    <a routerLink="/alumni/sessions" class="view-more">+{{ upcomingSessions().length - 3 }} more</a>
                  }
                </div>
              } @else {
                <ab-empty-state title="No Upcoming Sessions" message="Schedule sessions with your mentees." actionLabel="Manage Bookings" actionRoute="/alumni/bookings" />
              }
            </div>
          </section>

          <!-- Availability Summary -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Availability</h2>
              <a routerLink="/alumni/availability" class="section-link">Manage</a>
            </header>
            <div class="section-content">
              <div class="availability-summary">
                <div class="summary-item">
                  <span class="summary-value">{{ availabilitySummary()?.activeSlots ?? 0 }}</span>
                  <span class="summary-label">Active Slots</span>
                </div>
                <div class="summary-item">
                  <span class="summary-value">{{ availabilitySummary()?.totalSlots ?? 0 }}</span>
                  <span class="summary-label">Total Slots</span>
                </div>
                <div class="summary-item">
                  <span class="summary-value">{{ availabilitySummary()?.sessionTypesConfigured ?? 0 }}</span>
                  <span class="summary-label">Session Types</span>
                </div>
              </div>
              <p class="summary-note">Set your availability to receive booking requests from students.</p>
            </div>
          </section>

          <!-- Rating Summary -->
          @if (ratingSummary()) {
            <section class="card dashboard-section">
              <header class="section-header">
                <h2 class="section-title">Your Rating</h2>
                <a routerLink="/alumni/reviews" class="section-link">View Reviews</a>
              </header>
              <div class="section-content">
                <div class="rating-summary">
                  <ab-rating-display [value]="ratingSummary()!.averageRating" [count]="ratingSummary()!.totalReviews" [showValue]="true" [showCount]="true" [readonly]="true" [size]="'lg'" />
                </div>
              </div>
            </section>
          }

          <!-- Stats Overview -->
          <section class="card dashboard-section stats-overview">
            <header class="section-header">
              <h2 class="section-title">Overview</h2>
            </header>
            <div class="section-content">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-value">{{ activeMentees().length }}</span>
                  <span class="stat-label">Active Mentees</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ completedSessionsCount() }}</span>
                  <span class="stat-label">Completed Sessions</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ pendingRequests().length }}</span>
                  <span class="stat-label">Pending Requests</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ unreadNotifications() }}</span>
                  <span class="stat-label">Unread Notifications</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Unread Notifications -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Notifications</h2>
              <a routerLink="/alumni/notifications" class="section-link">View All</a>
            </header>
            <div class="section-content">
              @if (unreadNotifications() > 0) {
                <div class="notification-summary">
                  <span class="unread-badge">{{ unreadNotifications() }}</span> unread notification{{ unreadNotifications() !== 1 ? 's' : '' }}
                  <a routerLink="/alumni/notifications" class="btn-primary btn-sm">View All</a>
                </div>
              } @else {
                <ab-empty-state title="All Caught Up" message="No new notifications at the moment." />
              }
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 1.5rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.5rem; }
    .card { background: #fff; border: 1px solid #e9ecef; border-radius: 0.75rem; overflow: hidden; }
    .section-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e9ecef; }
    .section-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .section-link { font-size: 0.875rem; font-weight: 500; color: #2c3e50; text-decoration: none; }
    .section-link:hover { text-decoration: underline; }
    .section-content { padding: 1.25rem 1.5rem; }

    /* Lists */
    .request-list, .mentee-list, .session-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .request-item, .mentee-item, .session-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1rem;
      background: #f8f9fa;
      border-radius: 0.5rem;
      gap: 1rem;
    }
    .request-info, .mentee-info, .session-info { display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1; }
    .avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .student-name, .mentor-name { display: block; font-weight: 500; color: #2c3e50; font-size: 0.875rem; }
    .student-meta, .mentor-role, .category, .session-type { display: block; font-size: 0.75rem; color: #6c757d; }
    .request-meta, .mentee-meta, .session-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .date, .next-session, .session-time { font-size: 0.75rem; color: #6c757d; }
    .view-more { display: block; text-align: center; padding: 0.5rem; font-size: 0.8125rem; font-weight: 500; color: #2c3e50; text-decoration: none; background: #f8f9fa; border-radius: 0.375rem; }
    .view-more:hover { background: #e9ecef; }

    /* Availability Summary */
    .availability-summary { display: flex; flex-direction: column; gap: 1rem; }
    .summary-item { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; }
    .summary-value { font-size: 2rem; font-weight: 700; color: #2c3e50; line-height: 1; }
    .summary-label { font-size: 0.75rem; font-weight: 500; color: #6c757d; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-note { margin: 1rem 0 0; font-size: 0.8125rem; color: #6c757d; text-align: center; }

    /* Rating Summary */
    .rating-summary { display: flex; justify-content: center; }

    /* Stats Overview */
    .stats-overview { grid-column: 1 / -1; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; }
    .stat-item { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; }
    .stat-value { font-size: 2rem; font-weight: 700; color: #2c3e50; line-height: 1; }
    .stat-label { font-size: 0.75rem; font-weight: 500; color: #6c757d; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Notification Summary */
    .notification-summary { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .unread-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 0.75rem; font-size: 0.8125rem; font-weight: 600; color: #fff; background: #dc3545; border-radius: 9999px; }
    .btn-primary, .btn-secondary {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 500;
      border-radius: 0.375rem; border: none; cursor: pointer;
      transition: all 0.2s ease; text-decoration: none;
    }
    .btn-primary { color: #fff; background: #2c3e50; }
    .btn-primary:hover { background: #1a252f; }
    .btn-secondary { color: #495057; background: #fff; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }

    @media (max-width: 768px) {
      .dashboard { padding: 1rem; }
      .dashboard-grid { grid-template-columns: 1fr; }
      .page-title { font-size: 1.5rem; }
    }
  `]
})
export class AlumniDashboardComponent implements OnInit {
  alumniService = inject(AlumniService);

  pendingRequests = computed(() => this.alumniService.dashboard()?.pendingRequests ?? []);
  activeMentees = computed(() => this.alumniService.dashboard()?.activeMentees ?? []);
  upcomingSessions = computed(() => this.alumniService.dashboard()?.upcomingSessions ?? []);
  completedSessionsCount = computed(() => this.alumniService.dashboard()?.completedSessionsCount ?? 0);
  availabilitySummary = computed(() => this.alumniService.dashboard()?.availabilitySummary);
  unreadNotifications = computed(() => this.alumniService.dashboard()?.unreadNotifications ?? 0);
  ratingSummary = computed(() => this.alumniService.dashboard()?.ratingSummary);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.alumniService.getDashboard().subscribe();
    this.alumniService.getProfile().subscribe();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getSessionStatusVariant(status: string): 'success' | 'info' | 'warning' | 'danger' | 'default' {
    switch (status) { case 'COMPLETED': return 'success'; case 'SCHEDULED': return 'info'; case 'RESCHEDULED': return 'warning'; case 'CANCELLED': return 'danger'; default: return 'default'; }
  }
}