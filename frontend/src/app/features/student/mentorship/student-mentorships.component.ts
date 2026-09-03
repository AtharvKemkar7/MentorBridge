import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { MentorshipSummary, Mentorship } from '../../../core/models/mentorship.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';
import { UpdateMentorshipDto } from '../../../core/models/mentorship.model';

@Component({
  selector: 'ab-student-mentorships',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, ConfirmDialogComponent, ToastContainerComponent],
  template: `
    <div class="mentorships">
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
          <h1 class="page-title">My Mentorships</h1>
          <p class="page-subtitle">Manage your active and past mentorship relationships</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="false" message="Loading mentorships..." />
        </div>
      } @else if (error()) {
        <ab-error-state [message]="error()" (retry)="loadMentorships()" />
      } @else {
        <!-- Filter Tabs -->
        <nav class="filter-tabs" aria-label="Filter mentorships by status">
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

        @if (filteredMentorships().length) {
          <div class="mentorships-list">
            @for (mentorship of filteredMentorships(); track mentorship.id) {
              <article class="mentorship-card" [class]="'status-' + mentorship.status.toLowerCase()">
                <div class="mentorship-header">
                  <div class="mentor-info">
                    <div class="avatar" [style.background-image]="mentorship.mentorAvatarUrl ? 'url(' + mentorship.mentorAvatarUrl + ')' : ''">
                      @if (!mentorship.mentorAvatarUrl) {
                        {{ getInitials(mentorship.mentorName) }}
                      }
                    </div>
                    <div class="mentor-details">
                      <a [routerLink]="['/student/alumni', mentorship.mentorId]" class="mentor-name">{{ mentorship.mentorName }}</a>
                      <span class="mentor-role">{{ mentorship.mentorCurrentRole }} @ {{ mentorship.mentorCompany }}</span>
                    </div>
                  </div>
                  <div class="mentorship-status">
                    <ab-status-badge [label]="mentorship.status" [variant]="getStatusVariant(mentorship.status)" [dot]="true" />
                    <span class="mentorship-category">{{ mentorship.category }}</span>
                  </div>
                </div>

                <div class="mentorship-body">
                  <div class="mentorship-meta">
                    <div class="meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span>Started: {{ formatDate(mentorship.startDate) }}</span>
                    </div>
                    @if (mentorship.endDate) {
                      <div class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>Ended: {{ formatDate(mentorship.endDate!) }}</span>
                      </div>
                    }
                    @if (mentorship.pausedAt) {
                      <div class="meta-item paused">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        <span>Paused: {{ formatDate(mentorship.pausedAt!) }}{{ mentorship.pauseReason ? ' - ' + mentorship.pauseReason : '' }}</span>
                      </div>
                    }
                  </div>

                  @if (mentorship.latestActivity) {
                    <div class="latest-activity">
                      <span class="activity-label">Latest Activity</span>
                      <div class="activity-item" [class]="'type-' + mentorship.latestActivity.type.toLowerCase().replace('_', '-')">
                        <span class="activity-time">{{ formatDateTime(mentorship.latestActivity.createdAt) }}</span>
                        <span class="activity-text">{{ mentorship.latestActivity.description }}</span>
                        <span class="activity-actor">by {{ mentorship.latestActivity.actorName }}</span>
                      </div>
                    </div>
                  }
                </div>

                <div class="mentorship-footer">
                  <div class="mentorship-actions">
                    @if (mentorship.status === 'ACTIVE') {
                      <button type="button" class="btn-secondary btn-sm" (click)="openPauseDialog(mentorship)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        Pause
                      </button>
                      <button type="button" class="btn-danger btn-sm" (click)="openEndDialog(mentorship)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        End
                      </button>
                    } @else if (mentorship.status === 'PAUSED') {
                      <button type="button" class="btn-primary btn-sm" (click)="resumeMentorship(mentorship)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Resume
                      </button>
                      <button type="button" class="btn-danger btn-sm" (click)="openEndDialog(mentorship)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        End
                      </button>
                    }
                    <a [routerLink]="['/student/alumni', mentorship.mentorId]" class="btn-secondary btn-sm">View Mentor</a>
                  </div>
                </div>
              </article>
            }
          </div>
        } @else {
          <ab-empty-state
            [title]="getEmptyTitle()"
            [message]="getEmptyMessage()"
            [actionLabel]="activeTab() === 'ACTIVE' ? 'Discover Alumni' : ''"
            [actionRoute]="activeTab() === 'ACTIVE' ? '/student/alumni' : ''"
            [centered]="true"
          />
        }
      }
    </div>
  `,
  styles: [`
    .mentorships { padding: 1.5rem; }
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

    .mentorships-list { display: flex; flex-direction: column; gap: 1rem; }
    .mentorship-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .mentorship-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border-color: #dee2e6; }
    .mentorship-card.status-active { border-left: 4px solid #28a745; }
    .mentorship-card.status-paused { border-left: 4px solid #ffc107; }
    .mentorship-card.status-ended { border-left: 4px solid #6c757d; }

    .mentorship-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem 1.5rem; gap: 1rem; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
    .mentor-info { display: flex; align-items: center; gap: 1rem; min-width: 0; flex: 1; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .mentor-name { display: block; font-weight: 600; color: #2c3e50; text-decoration: none; }
    .mentor-name:hover { text-decoration: underline; }
    .mentor-role { display: block; font-size: 0.8125rem; color: #6c757d; }
    .mentorship-status { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; text-align: right; flex-shrink: 0; }
    .mentorship-category { font-size: 0.8125rem; color: #6c757d; }

    .mentorship-body { padding: 1.25rem 1.5rem; }
    .mentorship-meta { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .meta-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #6c757d; }
    .meta-item.paused { color: #f0ad4e; }
    .meta-item svg { color: #adb5bd; flex-shrink: 0; }

    .latest-activity { padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; border: 1px solid #e9ecef; }
    .activity-label { display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6c757d; margin-bottom: 0.5rem; }
    .activity-item { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; }
    .activity-time { font-size: 0.75rem; color: #adb5bd; }
    .activity-text { color: #2c3e50; }
    .activity-actor { font-size: 0.75rem; color: #6c757d; }

    .mentorship-footer { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-top: 1px solid #e9ecef; background: #f8f9fa; flex-wrap: wrap; gap: 0.5rem; }
    .mentorship-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-primary, .btn-secondary, .btn-danger {
      display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; transition: all 0.2s ease; text-decoration: none;
    }
    .btn-primary { padding: 0.5rem 1rem; color: #fff; background: #2c3e50; }
    .btn-primary:hover { background: #1a252f; }
    .btn-secondary { padding: 0.5rem 1rem; color: #495057; background: #fff; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    .btn-danger { padding: 0.5rem 1rem; color: #fff; background: #dc3545; }
    .btn-danger:hover { background: #c82333; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }

    @media (max-width: 768px) {
      .mentorships { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .mentorship-header { flex-direction: column; align-items: flex-start; }
      .mentorship-status { align-items: flex-start; width: 100%; }
    }
  `]
})
export class StudentMentorshipsComponent implements OnInit {
  studentService = inject(StudentService);
  mentorshipService = inject(MentorshipService);
  toast = inject(ToastContainerComponent);

  mentorships = signal<MentorshipSummary[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'ALL' | 'ACTIVE' | 'PAUSED' | 'ENDED'>('ALL');

  showConfirmDialog = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmLabel = signal('');
  confirmVariant = signal<'danger' | 'primary'>('danger');
  confirmActionFn = signal<() => void>(() => {});

  statusTabs = [
    { value: 'ALL', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'ENDED', label: 'Ended' },
  ];

  filteredMentorships = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ALL') return this.mentorships();
    return this.mentorships().filter(m => m.status === tab);
  });

  ngOnInit(): void {
    this.loadMentorships();
  }

  loadMentorships(): void {
    this.loading.set(true);
    this.error.set(null);
    this.studentService.getMentorships().subscribe({
      next: (mentorships) => {
        this.mentorships.set(mentorships);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load mentorships');
        this.loading.set(false);
      }
    });
  }

  setActiveTab(tab: 'ALL' | 'ACTIVE' | 'PAUSED' | 'ENDED'): void {
    this.activeTab.set(tab);
  }

  getTabCount(status: string): number {
    if (status === 'ALL') return this.mentorships().length;
    return this.mentorships().filter(m => m.status === status).length;
  }

  openPauseDialog(mentorship: MentorshipSummary): void {
    this.confirmTitle.set('Pause Mentorship');
    this.confirmMessage.set(`Are you sure you want to pause your mentorship with ${mentorship.mentorName}? You can resume it later.`);
    this.confirmLabel.set('Pause');
    this.confirmVariant.set('warning');
    this.confirmActionFn.set(() => this.pauseMentorship(mentorship));
    this.showConfirmDialog.set(true);
  }

  openEndDialog(mentorship: MentorshipSummary): void {
    this.confirmTitle.set('End Mentorship');
    this.confirmMessage.set(`Are you sure you want to end your mentorship with ${mentorship.mentorName}? This action cannot be undone.`);
    this.confirmLabel.set('End Mentorship');
    this.confirmVariant.set('danger');
    this.confirmActionFn.set(() => this.endMentorship(mentorship));
    this.showConfirmDialog.set(true);
  }

  confirmAction(): void {
    this.confirmActionFn()();
    this.showConfirmDialog.set(false);
  }

  pauseMentorship(mentorship: MentorshipSummary): void {
    const payload: UpdateMentorshipDto = { action: 'PAUSE' };
    this.mentorshipService.updateMentorship(payload).subscribe({
      next: () => {
        this.toast.success('Mentorship Paused', `Your mentorship with ${mentorship.mentorName} has been paused.`);
        this.loadMentorships();
      },
      error: (err) => this.toast.error('Pause Failed', err.error?.message || 'Failed to pause mentorship')
    });
  }

  resumeMentorship(mentorship: MentorshipSummary): void {
    const payload: UpdateMentorshipDto = { action: 'RESUME' };
    this.mentorshipService.updateMentorship(payload).subscribe({
      next: () => {
        this.toast.success('Mentorship Resumed', `Your mentorship with ${mentorship.mentorName} has been resumed.`);
        this.loadMentorships();
      },
      error: (err) => this.toast.error('Resume Failed', err.error?.message || 'Failed to resume mentorship')
    });
  }

  endMentorship(mentorship: MentorshipSummary): void {
    const payload: UpdateMentorshipDto = { action: 'END' };
    this.mentorshipService.updateMentorship(payload).subscribe({
      next: () => {
        this.toast.success('Mentorship Ended', `Your mentorship with ${mentorship.mentorName} has been ended.`);
        this.loadMentorships();
      },
      error: (err) => this.toast.error('End Failed', err.error?.message || 'Failed to end mentorship')
    });
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

  getStatusVariant(status: string): 'success' | 'warning' | 'default' {
    switch (status) { case 'ACTIVE': return 'success'; case 'PAUSED': return 'warning'; default: return 'default'; }
  }

  getEmptyTitle(): string {
    switch (this.activeTab()) {
      case 'ACTIVE': return 'No Active Mentorships';
      case 'PAUSED': return 'No Paused Mentorships';
      case 'ENDED': return 'No Ended Mentorships';
      default: return 'No Mentorships Yet';
    }
  }

  getEmptyMessage(): string {
    switch (this.activeTab()) {
      case 'ACTIVE': return 'Start your mentorship journey by discovering alumni mentors.';
      case 'PAUSED': return 'Paused mentorships will appear here.';
      case 'ENDED': return 'Ended mentorships will appear here.';
      default: return 'Discover alumni and request mentorship to get started.';
    }
  }
}