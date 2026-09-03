import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlumniService } from '../../../core/services/alumni.service';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { MenteeSummary, Mentorship } from '../../../core/models/alumni.model';
import { UpdateMentorshipDto } from '../../../core/models/mentorship.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'ab-alumni-mentorships',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, ToastContainerComponent, ConfirmDialogComponent],
  template: `
    <div class="mentorships-page">
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
          <h1 class="page-title">My Mentees</h1>
          <p class="page-subtitle">Manage your active mentorship relationships</p>
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

        @if (filteredMentees().length) {
          <div class="mentees-list">
            @for (mentee of filteredMentees(); track mentee.id) {
              <article class="mentee-card" [class]="'status-' + mentee.status.toLowerCase()">
                <div class="mentee-header">
                  <div class="student-info">
                    <div class="avatar" [style.background-image]="mentee.studentAvatarUrl ? 'url(' + mentee.studentAvatarUrl + ')' : ''">
                      @if (!mentee.studentAvatarUrl) {
                        {{ getInitials(mentee.studentName) }}
                      }
                    </div>
                    <div class="student-details">
                      <a [routerLink]="['/student/alumni', mentee.studentId]" class="student-name">{{ mentee.studentName }}</a>
                      <span class="student-meta">{{ mentee.studentMajor || 'Student' }}{{ mentee.studentGraduationYear ? ' • Class of ' + mentee.studentGraduationYear : '' }}</span>
                    </div>
                  </div>
                  <div class="mentee-status">
                    <ab-status-badge [label]="mentee.status" [variant]="getStatusVariant(mentee.status)" [dot]="true" />
                    <span class="mentee-category">{{ mentee.category }}</span>
                  </div>
                </div>

                <div class="mentee-body">
                  <div class="mentee-meta">
                    <div class="meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span>Started: {{ formatDate(mentee.startDate) }}</span>
                    </div>
                    @if (mentee.lastSessionDate) {
                      <div class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span>Last Session: {{ formatDate(mentee.lastSessionDate!) }}</span>
                      </div>
                    }
                    @if (mentee.nextSessionDate) {
                      <div class="meta-item next">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 4 15 4 15 4 22 11 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        <span>Next Session: {{ formatDate(mentee.nextSessionDate!) }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="mentee-footer">
                  <div class="mentee-actions">
                    @if (mentee.status === 'ACTIVE') {
                      <button type="button" class="btn-secondary btn-sm" (click)="openPauseDialog(mentee)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        Pause
                      </button>
                      <button type="button" class="btn-danger btn-sm" (click)="openEndDialog(mentee)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        End
                      </button>
                    } @else if (mentee.status === 'PAUSED') {
                      <button type="button" class="btn-primary btn-sm" (click)="resumeMentorship(mentee)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Resume
                      </button>
                      <button type="button" class="btn-danger btn-sm" (click)="openEndDialog(mentee)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        End
                      </button>
                    }
                    <a [routerLink]="['/student/alumni', mentee.studentId]" class="btn-secondary btn-sm">View Profile</a>
                  </div>
                </div>
              </article>
            }
          </div>
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
    .mentorships-page { padding: 1.5rem; }
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

    .mentees-list { display: flex; flex-direction: column; gap: 1rem; }
    .mentee-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .mentee-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border-color: #dee2e6; }
    .mentee-card.status-active { border-left: 4px solid #28a745; }
    .mentee-card.status-paused { border-left: 4px solid #ffc107; }
    .mentee-card.status-ended { border-left: 4px solid #6c757d; }

    .mentee-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem 1.5rem; gap: 1rem; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
    .student-info { display: flex; align-items: center; gap: 1rem; min-width: 0; flex: 1; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #2c3e50, #1a252f); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; background-size: cover; background-position: center; flex-shrink: 0; }
    .student-name { display: block; font-weight: 600; color: #2c3e50; text-decoration: none; }
    .student-name:hover { text-decoration: underline; }
    .student-meta { display: block; font-size: 0.8125rem; color: #6c757d; }
    .mentee-status { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; text-align: right; flex-shrink: 0; }
    .mentee-category { font-size: 0.8125rem; color: #6c757d; }

    .mentee-body { padding: 1.25rem 1.5rem; }
    .mentee-meta { display: flex; flex-direction: column; gap: 0.5rem; }
    .meta-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #6c757d; }
    .meta-item.next { color: #1a73e8; }
    .meta-item svg { color: #adb5bd; flex-shrink: 0; }

    .mentee-footer { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-top: 1px solid #e9ecef; background: #f8f9fa; flex-wrap: wrap; gap: 0.5rem; }
    .mentee-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
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
      .mentorships-page { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .mentee-header { flex-direction: column; align-items: flex-start; }
      .mentee-status { align-items: flex-start; width: 100%; }
    }
  `]
})
export class AlumniMentorshipsComponent implements OnInit {
  alumniService = inject(AlumniService);
  mentorshipService = inject(MentorshipService);
  toast = inject(ToastContainerComponent);

  mentees = signal<MenteeSummary[]>([]);
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

  filteredMentees = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ALL') return this.mentees();
    return this.mentees().filter(m => m.status === tab);
  });

  ngOnInit(): void {
    this.loadMentorships();
  }

  loadMentorships(): void {
    this.loading.set(true);
    this.error.set(null);
    this.alumniService.getMentees().subscribe({
      next: (mentees) => {
        this.mentees.set(mentees);
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
    if (status === 'ALL') return this.mentees().length;
    return this.mentees().filter(m => m.status === status).length;
  }

  openPauseDialog(mentee: MenteeSummary): void {
    this.confirmTitle.set('Pause Mentorship');
    this.confirmMessage.set(`Pause your mentorship with ${mentee.studentName}? You can resume it later.`);
    this.confirmLabel.set('Pause');
    this.confirmVariant.set('warning');
    this.confirmActionFn.set(() => this.pauseMentorship(mentee));
    this.showConfirmDialog.set(true);
  }

  openEndDialog(mentee: MenteeSummary): void {
    this.confirmTitle.set('End Mentorship');
    this.confirmMessage.set(`End your mentorship with ${mentee.studentName}? This action cannot be undone.`);
    this.confirmLabel.set('End Mentorship');
    this.confirmVariant.set('danger');
    this.confirmActionFn.set(() => this.endMentorship(mentee));
    this.showConfirmDialog.set(true);
  }

  confirmAction(): void {
    this.confirmActionFn()();
    this.showConfirmDialog.set(false);
  }

  pauseMentorship(mentee: MenteeSummary): void {
    const payload: UpdateMentorshipDto = { action: 'PAUSE' };
    this.mentorshipService.updateMentorship(payload).subscribe({
      next: () => {
        this.toast.success('Mentorship Paused', `Mentorship with ${mentee.studentName} has been paused.`);
        this.loadMentorships();
      },
      error: (err) => this.toast.error('Pause Failed', err.error?.message || 'Failed to pause mentorship')
    });
  }

  resumeMentorship(mentee: MenteeSummary): void {
    const payload: UpdateMentorshipDto = { action: 'RESUME' };
    this.mentorshipService.updateMentorship(payload).subscribe({
      next: () => {
        this.toast.success('Mentorship Resumed', `Mentorship with ${mentee.studentName} has been resumed.`);
        this.loadMentorships();
      },
      error: (err) => this.toast.error('Resume Failed', err.error?.message || 'Failed to resume mentorship')
    });
  }

  endMentorship(mentee: MenteeSummary): void {
    const payload: UpdateMentorshipDto = { action: 'END' };
    this.mentorshipService.updateMentorship(payload).subscribe({
      next: () => {
        this.toast.success('Mentorship Ended', `Mentorship with ${mentee.studentName} has been ended.`);
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

  getStatusVariant(status: string): 'success' | 'warning' | 'default' {
    switch (status) { case 'ACTIVE': return 'success'; case 'PAUSED': return 'warning'; default: return 'default'; }
  }

  getEmptyTitle(): string {
    switch (this.activeTab()) {
      case 'ACTIVE': return 'No Active Mentees';
      case 'PAUSED': return 'No Paused Mentorships';
      case 'ENDED': return 'No Ended Mentorships';
      default: return 'No Mentees Yet';
    }
  }

  getEmptyMessage(): string {
    switch (this.activeTab()) {
      case 'ACTIVE': return 'Accept mentorship requests to start mentoring students.';
      case 'PAUSED': return 'Paused mentorships will appear here.';
      case 'ENDED': return 'Ended mentorships will appear here.';
      default: return 'Accept mentorship requests to start building mentorship relationships.';
    }
  }
}