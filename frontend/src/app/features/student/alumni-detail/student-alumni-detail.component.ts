import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { MentorshipService, CreateMentorshipRequestDto } from '../../../core/services/mentorship.service';
import { AlumniSummary } from '../../../core/models/student.model';
import { MentorshipCategory, MENTORSHIP_CATEGORIES } from '../../../core/models/mentorship.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { RatingDisplayComponent } from '../../../shared/components/rating-display/rating-display.component';
import { ProfileCardComponent, ProfileCardData } from '../../../shared/components/profile-card/profile-card.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ab-student-alumni-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, RatingDisplayComponent, ProfileCardComponent, ConfirmDialogComponent, ToastContainerComponent],
  template: `
    <div class="alumni-detail">
      @if (loading()) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="true" message="Loading alumni profile..." />
        </div>
      } @else if (error()) {
        <div class="error-container">
          <ab-error-state [message]="error()" (retry)="loadAlumni()" />
        </div>
      } @else if (alumni()) {
        <ab-toast-container />
        <ab-confirm-dialog
          [open]="showConfirmDialog()"
          [title]="confirmTitle()"
          [message]="confirmMessage()"
          [confirmLabel]="confirmLabel()"
          [cancelLabel]="'Cancel'"
          (confirm)="confirmAction()"
          (cancel)="showConfirmDialog.set(false)"
        />

        <header class="page-header">
          <div class="header-content">
            <a routerLink="/student/alumni" class="back-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Directory
            </a>
            <h1 class="page-title">{{ alumni()!.firstName }} {{ alumni()!.lastName }}</h1>
            <p class="page-subtitle">{{ alumni()!.currentRole }} at {{ alumni()!.company }}</p>
          </div>
          <div class="header-badges">
            <ab-status-badge [label]="alumni()!.availabilityStatus" [variant]="getAvailabilityVariant()" [dot]="true" />
            <ab-status-badge [label]="alumni()!.verificationStatus" [variant]="getVerificationVariant()" />
          </div>
        </header>

        <div class="content-grid">
          <!-- Main Profile -->
          <main class="main-content">
            <section class="card profile-section">
              <ab-profile-card [profile]="toProfileCardData(alumni()!)" [detailed]="true" />
            </section>

            <!-- Professional Summary -->
            @if (alumni()!.bio) {
              <section class="card">
                <header class="section-header">
                  <h2 class="section-title">Professional Summary</h2>
                </header>
                <div class="section-content">
                  <p class="bio-text">{{ alumni()!.bio }}</p>
                </div>
              </section>
            }

            <!-- Experience & Education -->
            <section class="card">
              <header class="section-header">
                <h2 class="section-title">Experience & Education</h2>
              </header>
              <div class="section-content">
                <div class="experience-grid">
                  <div class="experience-item">
                    <h3 class="experience-label">Current Role</h3>
                    <p class="experience-value">{{ alumni()!.currentRole }}</p>
                  </div>
                  <div class="experience-item">
                    <h3 class="experience-label">Company</h3>
                    <p class="experience-value">{{ alumni()!.company }}</p>
                  </div>
                  <div class="experience-item">
                    <h3 class="experience-label">Experience</h3>
                    <p class="experience-value">{{ alumni()!.experienceYears }} years</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Skills & Expertise -->
            <section class="card">
              <header class="section-header">
                <h2 class="section-title">Skills & Expertise</h2>
              </header>
              <div class="section-content">
                <div class="skills-section">
                  <h3 class="subsection-title">Skills</h3>
                  <div class="tags">
                    @for (skill of alumni()!.skills; track skill) {
                      <span class="tag">{{ skill }}</span>
                    }
                    @if (!alumni()!.skills.length) {
                      <span class="tag empty">No skills listed</span>
                    }
                  </div>
                </div>
                <div class="expertise-section">
                  <h3 class="subsection-title">Expertise Areas</h3>
                  <div class="tags">
                    @for (exp of alumni()!.expertise; track exp) {
                      <span class="tag">{{ exp }}</span>
                    }
                    @if (!alumni()!.expertise.length) {
                      <span class="tag empty">No expertise listed</span>
                    }
                  </div>
                </div>
                <div class="mentorship-section">
                  <h3 class="subsection-title">Mentorship Areas</h3>
                  <div class="tags">
                    @for (area of alumni()!.mentorshipAreas; track area) {
                      <span class="tag">{{ area }}</span>
                    }
                    @if (!alumni()!.mentorshipAreas.length) {
                      <span class="tag empty">No mentorship areas listed</span>
                    }
                  </div>
                </div>
              </div>
            </section>

            <!-- Availability & Session Types -->
            <section class="card">
              <header class="section-header">
                <h2 class="section-title">Availability & Session Types</h2>
              </header>
              <div class="section-content">
                <div class="availability-info">
                  <div class="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>Timezone: {{ alumni()!.timezone || 'Not specified' }}</span>
                  </div>
                  <div class="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>Status: {{ alumni()!.availabilityStatus }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Ratings & Reviews -->
            @if (alumni()!.averageRating !== undefined) {
              <section class="card">
                <header class="section-header">
                  <h2 class="section-title">Ratings & Reviews</h2>
                </header>
                <div class="section-content">
                  <div class="rating-summary">
                    <ab-rating-display [value]="alumni()!.averageRating!" [count]="alumni()!.totalReviews" [showValue]="true" [showCount]="true" [readonly]="true" [size]="'lg'" />
                    <p class="rating-text">Based on {{ alumni()!.totalReviews || 0 }} review{{ (alumni()!.totalReviews || 0) !== 1 ? 's' : '' }}</p>
                  </div>
                </div>
              </section>
            }
          </main>

          <!-- Sidebar Actions -->
          <aside class="sidebar">
            <section class="card action-card">
              <h2 class="action-title">Request Mentorship</h2>
              <p class="action-description">Connect with this alumni for personalized guidance and support.</p>
              
              <form class="request-form" (ngSubmit)="submitRequest()" #requestForm="ngForm">
                <div class="form-group">
                  <label for="category" class="form-label">Mentorship Category <span class="required">*</span></label>
                  <select id="category" class="form-select" name="category" [(ngModel)]="requestData.category" required>
                    <option value="">Select a category</option>
                    @for (cat of mentorshipCategories; track cat.value) {
                      <option [value]="cat.value">{{ cat.label }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="message" class="form-label">Message / Reason <span class="required">*</span></label>
                  <textarea id="message" class="form-textarea" name="message" rows="4" [(ngModel)]="requestData.message" required placeholder="Explain why you're seeking mentorship and what you hope to achieve..."></textarea>
                  <p class="form-hint">Be specific about your goals and what you're looking for in a mentor.</p>
                </div>

                <button type="submit" class="btn-primary btn-block" [disabled]="submitting() || requestForm.invalid">
                  @if (submitting()) {
                    <ab-loading-spinner [size]="18" [inline]="true" />
                  } @else {
                    Send Request
                  }
                </button>
              </form>

              @if (isOwnProfile()) {
                <div class="self-profile-notice">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>This is your own profile. You cannot request mentorship from yourself.</span>
                </div>
              }
            </section>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .alumni-detail { padding: 1.5rem; }
    .loading-container, .error-container { display: flex; align-items: center; justify-content: center; min-height: 50vh; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .header-content { display: flex; flex-direction: column; gap: 0.5rem; }
    .back-link { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #6c757d; text-decoration: none; transition: color 0.2s ease; }
    .back-link:hover { color: #2c3e50; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .header-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .content-grid { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; }
    .main-content { display: flex; flex-direction: column; gap: 1.5rem; }
    .sidebar { position: sticky; top: 1.5rem; height: fit-content; }

    .card { background: #fff; border: 1px solid #e9ecef; border-radius: 0.75rem; overflow: hidden; }
    .section-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e9ecef; }
    .section-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .section-content { padding: 1.25rem 1.5rem; }

    .bio-text { margin: 0; font-size: 0.9375rem; line-height: 1.7; color: #495057; }

    .experience-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; }
    .experience-item { display: flex; flex-direction: column; gap: 0.375rem; }
    .experience-label { margin: 0; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6c757d; }
    .experience-value { margin: 0; font-size: 1rem; font-weight: 500; color: #2c3e50; }

    .skills-section, .expertise-section, .mentorship-section { margin-bottom: 1.5rem; }
    .skills-section:last-child, .expertise-section:last-child, .mentorship-section:last-child { margin-bottom: 0; }
    .subsection-title { margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 600; color: #2c3e50; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag { padding: 0.375rem 0.75rem; font-size: 0.8125rem; font-weight: 500; background: #f8f9fa; color: #495057; border: 1px solid #e9ecef; border-radius: 0.375rem; }
    .tag.empty { color: #adb5bd; font-style: italic; }

    .availability-info { display: flex; flex-direction: column; gap: 1rem; }
    .info-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9375rem; color: #495057; }
    .info-item svg { color: #6c757d; flex-shrink: 0; }

    .rating-summary { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; }
    .rating-text { margin: 0; font-size: 0.875rem; color: #6c757d; }

    .action-card { padding: 1.5rem; }
    .action-title { margin: 0 0 0.5rem; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .action-description { margin: 0 0 1.5rem; font-size: 0.875rem; color: #6c757d; }

    .request-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-label { font-size: 0.8125rem; font-weight: 500; color: #2c3e50; }
    .required { color: #dc3545; }
    .form-select, .form-textarea {
      padding: 0.625rem 0.875rem; font-size: 0.9375rem; color: #2c3e50;
      background: #fff; border: 1px solid #dee2e6; border-radius: 0.375rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .form-select:focus, .form-textarea:focus { outline: none; border-color: #2c3e50; box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.15); }
    .form-textarea { resize: vertical; min-height: 100px; font-family: inherit; }
    .form-hint { margin: 0; font-size: 0.75rem; color: #6c757d; }
    .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-size: 0.9375rem; font-weight: 600; color: #fff; background: #2c3e50; border: none; border-radius: 0.375rem; cursor: pointer; transition: background 0.2s ease; }
    .btn-primary:hover:not(:disabled) { background: #1a252f; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-block { width: 100%; }

    .self-profile-notice { display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 0.5rem; color: #856404; font-size: 0.875rem; }
    .self-profile-notice svg { flex-shrink: 0; margin-top: 0.125rem; }

    @media (max-width: 992px) {
      .content-grid { grid-template-columns: 1fr; }
      .sidebar { position: static; }
    }
    @media (max-width: 768px) {
      .alumni-detail { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .experience-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StudentAlumniDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  studentService = inject(StudentService);
  mentorshipService = inject(MentorshipService);
  toast = inject(ToastContainerComponent);

  alumniId = signal('');
  alumni = signal<AlumniSummary | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);

  showConfirmDialog = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmLabel = signal('');
  confirmActionFn = signal<() => void>(() => {});

  requestData = { category: '', message: '' };
  mentorshipCategories = MENTORSHIP_CATEGORIES;

  isOwnProfile = computed(() => {
    const studentId = this.studentService.profile()?.id;
    return studentId && studentId === this.alumni()?.id;
  });

  ngOnInit(): void {
    this.alumniId.set(this.route.snapshot.paramMap.get('id') || '');
    this.loadAlumni();
  }

  loadAlumni(): void {
    if (!this.alumniId()) return;
    this.loading.set(true);
    this.error.set(null);
    this.studentService.getAlumniById(this.alumniId()).subscribe({
      next: (alumni) => {
        this.alumni.set(alumni);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load alumni profile');
        this.loading.set(false);
      }
    });
  }

  submitRequest(): void {
    if (this.submitting() || !this.requestData.category || !this.requestData.message.trim()) return;
    if (this.isOwnProfile()) return;

    this.submitting.set(true);
    const payload: CreateMentorshipRequestDto = {
      mentorId: this.alumniId(),
      category: this.requestData.category,
      message: this.requestData.message.trim(),
    };

    this.mentorshipService.createRequest(payload).subscribe({
      next: () => {
        this.toast.success('Request Sent', 'Your mentorship request has been sent successfully.');
        this.requestData = { category: '', message: '' };
        this.submitting.set(false);
      },
      error: (err) => {
        this.toast.error('Request Failed', err.error?.message || 'Failed to send mentorship request');
        this.submitting.set(false);
      }
    });
  }

  toProfileCardData(alumni: AlumniSummary): ProfileCardData {
    return {
      id: alumni.id,
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      email: '',
      avatarUrl: alumni.avatarUrl,
      role: 'ALUMNI',
      bio: alumni.bio,
      currentRole: alumni.currentRole,
      company: alumni.company,
      experienceYears: alumni.experienceYears,
      skills: alumni.skills,
      expertise: alumni.expertise,
      mentorshipAreas: alumni.mentorshipAreas,
      verificationStatus: alumni.verificationStatus,
      averageRating: alumni.averageRating,
      totalReviews: alumni.totalReviews,
    };
  }

  getAvailabilityVariant(): 'success' | 'warning' | 'default' {
    switch (this.alumni()?.availabilityStatus) {
      case 'AVAILABLE': return 'success';
      case 'BUSY': return 'warning';
      default: return 'default';
    }
  }

  getVerificationVariant(): 'success' | 'warning' | 'default' {
    switch (this.alumni()?.verificationStatus) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  }
}