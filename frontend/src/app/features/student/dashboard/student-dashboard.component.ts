import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AlumniCardComponent, AlumniCardData } from '../../../shared/components/alumni-card/alumni-card.component';
import { StudentDashboardData, MentorshipSummary, MentorshipRequestSummary, SessionSummary } from '../../../core/models/student.model';

@Component({
  selector: 'ab-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, AlumniCardComponent],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back, {{ studentService.profile()?.firstName }}!</p>
        </div>
        <div class="header-actions">
          <ab-loading-spinner *ngIf="studentService.isLoading()" [size]="24" [overlay]="false" />
        </div>
      </header>

      @if (studentService.error()) {
        <ab-error-state [message]="studentService.error()!" (retry)="loadDashboard()" />
      } @else {
        <div class="dashboard-grid">
          <!-- Profile Completion -->
          <section class="card dashboard-section profile-completion">
            <header class="section-header">
              <h2 class="section-title">Profile Completion</h2>
            </header>
            <div class="section-content">
              <div class="completion-circle" [style.--progress]="profileCompletion() + '%'">
                <span class="completion-value">{{ profileCompletion() }}%</span>
              </div>
              <p class="completion-label">Complete your profile to get better matches</p>
              <a routerLink="/student/profile" class="btn-primary btn-sm">Edit Profile</a>
            </div>
          </section>

          <!-- Active Mentorships -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Active Mentorships</h2>
              <a routerLink="/student/mentorship" class="section-link">View All</a>
            </header>
            <div class="section-content">
              @if (activeMentorships().length) {
                <div class="mentorship-list">
                  @for (mentorship of activeMentorships(); track mentorship.id) {
                    <div class="mentorship-item">
                      <div class="mentor-info">
                        <div class="avatar-sm" [style.background-image]="mentorship.mentorAvatarUrl ? 'url(' + mentorship.mentorAvatarUrl + ')' : ''">
                          @if (!mentorship.mentorAvatarUrl) {
                            {{ getInitials(mentorship.mentorName) }}
                          }
                        </div>
                        <div>
                          <span class="mentor-name">{{ mentorship.mentorName }}</span>
                          <span class="mentor-role">{{ mentorship.mentorCurrentRole }} @ {{ mentorship.mentorCompany }}</span>
                        </div>
                      </div>
                      <div class="mentorship-meta">
                        <ab-status-badge [label]="mentorship.status" [variant]="getMentorshipStatusVariant(mentorship.status)" [dot]="true" />
                        <span class="category">{{ mentorship.category }}</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <ab-empty-state
                  title="No Active Mentorships"
                  message="Start your mentorship journey by discovering alumni mentors."
                  actionLabel="Discover Alumni"
                  actionRoute="/student/alumni"
                />
              }
            </div>
          </section>

          <!-- Pending Requests -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Pending Requests</h2>
              <a routerLink="/student/mentorship/requests" class="section-link">View All</a>
            </header>
            <div class="section-content">
              @if (pendingRequests().length) {
                <div class="request-list">
                  @for (request of pendingRequests(); track request.id) {
                    <div class="request-item">
                      <div class="request-info">
                        <div class="avatar-sm" [style.background-image]="request.mentorAvatarUrl ? 'url(' + request.mentorAvatarUrl + ')' : ''">
                          @if (!request.mentorAvatarUrl) {
                            {{ getInitials(request.mentorName) }}
                          }
                        </div>
                        <div>
                          <span class="mentor-name">{{ request.mentorName }}</span>
                          <span class="category">{{ request.category }}</span>
                        </div>
                      </div>
                      <div class="request-meta">
                        <ab-status-badge [label]="request.status" [variant]="getRequestStatusVariant(request.status)" />
                        <span class="date">{{ formatDate(request.requestedAt) }}</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <ab-empty-state
                  title="No Pending Requests"
                  message="Your mentorship requests will appear here once submitted."
                  actionLabel="Request Mentorship"
                  actionRoute="/student/alumni"
                />
              }
            </div>
          </section>

          <!-- Upcoming Sessions -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Upcoming Sessions</h2>
              <a routerLink="/student/sessions" class="section-link">View All</a>
            </header>
            <div class="section-content">
              @if (upcomingSessions().length) {
                <div class="session-list">
                  @for (session of upcomingSessions(); track session.id) {
                    <div class="session-item">
                      <div class="session-info">
                        <div class="avatar-sm" [style.background-image]="session.mentorAvatarUrl ? 'url(' + session.mentorAvatarUrl + ')' : ''">
                          @if (!session.mentorAvatarUrl) {
                            {{ getInitials(session.mentorName) }}
                          }
                        </div>
                        <div>
                          <span class="mentor-name">{{ session.mentorName }}</span>
                          <span class="session-type">{{ session.type }}</span>
                        </div>
                      </div>
                      <div class="session-meta">
                        <ab-status-badge [label]="session.status" [variant]="getSessionStatusVariant(session.status)" />
                        <span class="session-time">{{ formatDateTime(session.scheduledAt) }}</span>
                        <span class="duration">{{ session.durationMinutes }} min</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <ab-empty-state
                  title="No Upcoming Sessions"
                  message="Book a session with your mentor to get started."
                  actionLabel="Book Session"
                  actionRoute="/student/bookings"
                />
              }
            </div>
          </section>

          <!-- Recently Discovered Alumni -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Recently Discovered Alumni</h2>
              <a routerLink="/student/alumni" class="section-link">Browse All</a>
            </header>
            <div class="section-content">
              @if (recentAlumni().length) {
                <div class="alumni-preview">
                  @for (alumni of recentAlumni(); track alumni.id) {
                    <ab-alumni-card [alumni]="alumni" [compact]="true" [showRequestButton]="true" (requestMentorship)="onRequestMentorship($event)" />
                  }
                </div>
              } @else {
                <ab-empty-state
                  title="No Alumni Found"
                  message="Complete your profile to get personalized recommendations."
                  actionLabel="Complete Profile"
                  actionRoute="/student/profile"
                />
              }
            </div>
          </section>

          <!-- Unread Notifications -->
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Notifications</h2>
              <a routerLink="/student/notifications" class="section-link">View All</a>
            </header>
            <div class="section-content">
              @if (unreadCount() > 0) {
                <div class="notification-summary">
                  <span class="unread-badge">{{ unreadCount() }}</span> unread notification{{ unreadCount() !== 1 ? 's' : '' }}
                  <a routerLink="/student/notifications" class="btn-primary btn-sm">View All</a>
                </div>
              } @else {
                <ab-empty-state
                  title="All Caught Up"
                  message="No new notifications at the moment."
                />
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

    /* Profile Completion */
    .profile-completion .section-content { display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; }
    .completion-circle {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: conic-gradient(#2c3e50 var(--progress), #e9ecef var(--progress));
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .completion-circle::before {
      content: '';
      position: absolute;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: #fff;
    }
    .completion-value { position: relative; font-size: 2rem; font-weight: 700; color: #2c3e50; }
    .completion-label { margin: 0; font-size: 0.875rem; color: #6c757d; }

    /* Lists */
    .mentorship-list, .request-list, .session-list { display: flex; flex-direction: column; gap: 1rem; }
    .mentorship-item, .request-item, .session-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 0.5rem;
      gap: 1rem;
    }
    .mentor-info, .request-info, .session-info { display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1; }
    .avatar-sm { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .mentor-name { display: block; font-weight: 500; color: #2c3e50; }
    .mentor-role, .category, .session-type { display: block; font-size: 0.8125rem; color: #6c757d; }
    .mentorship-meta, .request-meta, .session-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .date, .session-time, .duration { font-size: 0.8125rem; color: #6c757d; }

    /* Alumni Preview */
    .alumni-preview { display: flex; flex-direction: column; gap: 0.75rem; }

    /* Notification Summary */
    .notification-summary { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .unread-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 0.75rem; font-size: 0.8125rem; font-weight: 600; color: #fff; background: #dc3545; border-radius: 9999px; }

    /* Buttons */
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
export class StudentDashboardComponent implements OnInit {
  studentService = inject(StudentService);

  profileCompletion = computed(() => this.studentService.dashboard()?.profileCompletion ?? 0);
  activeMentorships = computed(() => this.studentService.dashboard()?.activeMentorships ?? []);
  pendingRequests = computed(() => this.studentService.dashboard()?.pendingRequests ?? []);
  upcomingSessions = computed(() => this.studentService.dashboard()?.upcomingSessions ?? []);
  recentAlumni = computed(() => this.studentService.dashboard()?.recentAlumni ?? []);
  unreadCount = computed(() => this.studentService.dashboard()?.unreadNotifications ?? 0);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.studentService.getDashboard().subscribe();
    this.studentService.getProfile().subscribe();
  }

  onRequestMentorship(alumniId: string): void {
    // Navigate to mentorship request page with pre-selected mentor
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

  getMentorshipStatusVariant(status: string): 'success' | 'warning' | 'default' {
    switch (status) { case 'ACTIVE': return 'success'; case 'PAUSED': return 'warning'; default: return 'default'; }
  }

  getRequestStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    switch (status) { case 'ACCEPTED': return 'success'; case 'PENDING': return 'warning'; case 'REJECTED': return 'danger'; default: return 'default'; }
  }

  getSessionStatusVariant(status: string): 'success' | 'info' | 'warning' | 'danger' | 'default' {
    switch (status) { case 'COMPLETED': return 'success'; case 'SCHEDULED': return 'info'; case 'RESCHEDULED': return 'warning'; case 'CANCELLED': return 'danger'; default: return 'default'; }
  }
}