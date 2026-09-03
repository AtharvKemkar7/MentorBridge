import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AlumniService } from '../../../core/services/alumni.service';
import { AlumniProfile } from '../../../core/models/alumni.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast.component';
import { ProfileCardComponent, ProfileCardData } from '../../../shared/components/profile-card/profile-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'ab-alumni-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorStateComponent, ToastContainerComponent, ProfileCardComponent, StatusBadgeComponent],
  template: `
    <div class="profile-page">
      <ab-toast-container />

      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Profile Settings</h1>
          <p class="page-subtitle">Manage your professional profile and mentorship preferences</p>
        </div>
      </header>

      @if (alumniService.error()) {
        <ab-error-state [message]="alumniService.error()!" (retry)="loadProfile()" />
      } @else if (loading()) {
        <div class="loading-container">
          <ab-loading-spinner [overlay]="false" message="Loading profile..." />
        </div>
      } @else if (profile()) {
        <div class="profile-grid">
          <!-- Current Profile Preview -->
          <aside class="profile-preview">
            <section class="card preview-card">
              <div class="preview-header">
                <ab-profile-card [profile]="toPreviewData(profile()!)" [detailed]="false" />
                <div class="verification-status">
                  <ab-status-badge [label]="profile()!.verificationStatus" [variant]="getVerificationVariant()" [dot]="true" />
                </div>
              </div>
              <div class="preview-stats">
                @if (profile()!.averageRating !== undefined) {
                  <div class="stat">
                    <ab-rating-display [value]="profile()!.averageRating!" [count]="profile()!.totalReviews" [showValue]="true" [showCount]="true" [readonly]="true" [size]="'sm'" />
                    <span class="stat-label">Average Rating</span>
                  </div>
                }
                <div class="stat">
                  <span class="stat-value">{{ profile()!.experienceYears }}</span>
                  <span class="stat-label">Years Experience</span>
                </div>
              </div>
            </section>
          </aside>

          <!-- Edit Form -->
          <main class="profile-form-section">
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
              <section class="card form-section">
                <header class="section-header">
                  <h2 class="section-title">Basic Information</h2>
                </header>
                <div class="section-content">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="firstName" class="form-label">First Name <span class="required">*</span></label>
                      <input id="firstName" type="text" class="form-input" formControlName="firstName" />
                      @if (profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched) {
                        <span class="form-error">First name is required</span>
                      }
                    </div>
                    <div class="form-group">
                      <label for="lastName" class="form-label">Last Name <span class="required">*</span></label>
                      <input id="lastName" type="text" class="form-input" formControlName="lastName" />
                      @if (profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched) {
                        <span class="form-error">Last name is required</span>
                      }
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input id="email" type="email" class="form-input" formControlName="email" readonly />
                    <span class="form-hint">Email cannot be changed. Contact support for changes.</span>
                  </div>
                  <div class="form-group">
                    <label for="bio" class="form-label">Bio / About</label>
                    <textarea id="bio" class="form-textarea" formControlName="bio" rows="4" placeholder="Tell students about yourself, your career journey, and what you can offer as a mentor..."></textarea>
                    <span class="form-hint">This will be visible to students when they view your profile.</span>
                  </div>
                </div>
              </section>

              <section class="card form-section">
                <header class="section-header">
                  <h2 class="section-title">Current Position</h2>
                </header>
                <div class="section-content">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="currentRole" class="form-label">Current Role <span class="required">*</span></label>
                      <input id="currentRole" type="text" class="form-input" formControlName="currentRole" placeholder="e.g., Senior Software Engineer" />
                      @if (profileForm.get('currentRole')?.invalid && profileForm.get('currentRole')?.touched) {
                        <span class="form-error">Current role is required</span>
                      }
                    </div>
                    <div class="form-group">
                      <label for="company" class="form-label">Company <span class="required">*</span></label>
                      <input id="company" type="text" class="form-input" formControlName="company" placeholder="e.g., Google" />
                      @if (profileForm.get('company')?.invalid && profileForm.get('company')?.touched) {
                        <span class="form-error">Company is required</span>
                      }
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="experienceYears" class="form-label">Years of Experience <span class="required">*</span></label>
                    <input id="experienceYears" type="number" class="form-input" formControlName="experienceYears" min="0" max="50" />
                    @if (profileForm.get('experienceYears')?.invalid && profileForm.get('experienceYears')?.touched) {
                      <span class="form-error">Valid experience years required</span>
                    }
                  </div>
                </div>
              </section>

              <section class="card form-section">
                <header class="section-header">
                  <h2 class="section-title">Skills & Expertise</h2>
                </header>
                <div class="section-content">
                  <div class="form-group">
                    <label class="form-label">Skills <span class="required">*</span></label>
                    <div class="tags-input">
                      <div class="selected-tags">
                        @for (skill of skillsArray(); track skill) {
                          <span class="tag">{{ skill }} <button type="button" class="tag-remove" (click)="removeSkill(skill)" aria-label="Remove {{ skill }}">×</button></span>
                        }
                      </div>
                      <input type="text" class="tag-input" placeholder="Add a skill (press Enter)" (keydown.enter)="addSkill($event)" (blur)="addSkill($event)" />
                      <span class="form-hint">Add your technical and professional skills. Press Enter after each skill.</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Expertise Areas</label>
                    <div class="tags-input">
                      <div class="selected-tags">
                        @for (exp of expertiseArray(); track exp) {
                          <span class="tag">{{ exp }} <button type="button" class="tag-remove" (click)="removeExpertise(exp)" aria-label="Remove {{ exp }}">×</button></span>
                        }
                      </div>
                      <input type="text" class="tag-input" placeholder="Add expertise area (press Enter)" (keydown.enter)="addExpertise($event)" (blur)="addExpertise($event)" />
                    </div>
                  </div>
                </div>
              </section>

              <section class="card form-section">
                <header class="section-header">
                  <h2 class="section-title">Mentorship Preferences</h2>
                </header>
                <div class="section-content">
                  <div class="form-group">
                    <label class="form-label">Career Interests</label>
                    <div class="tags-input">
                      <div class="selected-tags">
                        @for (interest of careerInterestsArray(); track interest) {
                          <span class="tag">{{ interest }} <button type="button" class="tag-remove" (click)="removeCareerInterest(interest)" aria-label="Remove {{ interest }}">×</button></span>
                        }
                      </div>
                      <input type="text" class="tag-input" placeholder="Add career interest (press Enter)" (keydown.enter)="addCareerInterest($event)" (blur)="addCareerInterest($event)" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Mentorship Areas</label>
                    <div class="tags-input">
                      <div class="selected-tags">
                        @for (area of mentorshipAreasArray(); track area) {
                          <span class="tag">{{ area }} <button type="button" class="tag-remove" (click)="removeMentorshipArea(area)" aria-label="Remove {{ area }}">×</button></span>
                        }
                      </div>
                      <input type="text" class="tag-input" placeholder="Add mentorship area (press Enter)" (keydown.enter)="addMentorshipArea($event)" (blur)="addMentorshipArea($event)" />
                      <span class="form-hint">Select areas where you'd like to mentor students.</span>
                    </div>
                  </div>
                </div>
              </section>

              <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="resetForm()">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="saving() || profileForm.invalid || profileForm.pristine">
                  @if (saving()) {
                    <ab-loading-spinner [size]="18" [inline]="true" />
                  } @else {
                    Save Changes
                  }
                </button>
              </div>
            </form>
          </main>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-page { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .header-content { display: flex; flex-direction: column; gap: 0.25rem; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .loading-container { display: flex; justify-content: center; padding: 3rem; }

    .profile-grid { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; }
    .profile-preview { position: sticky; top: 1.5rem; height: fit-content; }
    .preview-card { }
    .preview-header { position: relative; }
    .verification-status { position: absolute; top: 1.25rem; right: 1.25rem; }
    .preview-stats { display: flex; gap: 1.5rem; padding: 1.25rem 1.5rem; border-top: 1px solid #e9ecef; background: #f8f9fa; }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; flex: 1; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #2c3e50; }
    .stat-label { font-size: 0.75rem; font-weight: 500; color: #6c757d; text-transform: uppercase; letter-spacing: 0.05em; }

    .profile-form-section { min-width: 0; }
    .profile-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .card { background: #fff; border: 1px solid #e9ecef; border-radius: 0.75rem; overflow: hidden; }
    .section-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e9ecef; }
    .section-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .section-content { padding: 1.25rem 1.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-label { font-size: 0.8125rem; font-weight: 500; color: #2c3e50; }
    .required { color: #dc3545; }
    .form-input, .form-textarea {
      padding: 0.625rem 0.875rem; font-size: 0.9375rem; color: #2c3e50;
      background: #fff; border: 1px solid #dee2e6; border-radius: 0.375rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .form-input:focus, .form-textarea:focus { outline: none; border-color: #2c3e50; box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.15); }
    .form-input:disabled { background: #f8f9fa; color: #6c757d; }
    .form-input.ng-invalid.ng-touched, .form-textarea.ng-invalid.ng-touched { border-color: #dc3545; }
    .form-textarea { resize: vertical; min-height: 100px; font-family: inherit; }
    .form-error { font-size: 0.75rem; color: #dc3545; }
    .form-hint { font-size: 0.75rem; color: #6c757d; }

    .tags-input { display: flex; flex-direction: column; gap: 0.5rem; }
    .selected-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; min-height: 40px; }
    .tag { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.75rem; font-size: 0.8125rem; font-weight: 500; background: #e7f3ff; color: #1a73e8; border-radius: 9999px; }
    .tag-remove { display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; border: none; background: transparent; color: inherit; border-radius: 50%; cursor: pointer; font-size: 1rem; line-height: 1; }
    .tag-remove:hover { background: rgba(0,0,0,0.1); }
    .tag-input { padding: 0.625rem 0.875rem; font-size: 0.9375rem; color: #2c3e50; background: #fff; border: 1px solid #dee2e6; border-radius: 0.375rem; flex: 1; min-width: 200px; }
    .tag-input:focus { outline: none; border-color: #2c3e50; box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.15); }

    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.5rem; border-top: 1px solid #e9ecef; background: #f8f9fa; }
    .btn-primary, .btn-secondary {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem; font-size: 0.9375rem; font-weight: 600;
      border-radius: 0.375rem; border: none; cursor: pointer;
      transition: all 0.2s ease; text-decoration: none;
    }
    .btn-primary { color: #fff; background: #2c3e50; }
    .btn-primary:hover:not(:disabled) { background: #1a252f; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-secondary { color: #495057; background: #fff; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }

    @media (max-width: 992px) {
      .profile-grid { grid-template-columns: 1fr; }
      .profile-preview { position: static; }
    }
    @media (max-width: 768px) {
      .profile-page { padding: 1rem; }
      .page-title { font-size: 1.5rem; }
      .form-row { grid-template-columns: 1fr; }
      .form-actions { flex-direction: column-reverse; }
      .btn-primary, .btn-secondary { width: 100%; }
    }
  `]
})
export class AlumniProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  alumniService = inject(AlumniService);
  toast = inject(ToastContainerComponent);

  profile = this.alumniService.profile;
  loading = signal(true);
  saving = signal(false);

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    bio: [''],
    currentRole: ['', Validators.required],
    company: ['', Validators.required],
    experienceYears: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
  });

  skillsArray = signal<string[]>([]);
  expertiseArray = signal<string[]>([]);
  careerInterestsArray = signal<string[]>([]);
  mentorshipAreasArray = signal<string[]>([]);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.alumniService.getProfile().subscribe({
      next: (profile) => {
        this.patchForm(profile);
        this.loading.set(false);
      },
      error: (err) => {
        this.alumniService._error.set(err.error?.message || 'Failed to load profile');
        this.loading.set(false);
      }
    });
  }

  patchForm(profile: AlumniProfile): void {
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      bio: profile.bio || '',
      currentRole: profile.currentRole,
      company: profile.company,
      experienceYears: profile.experienceYears,
    });
    this.skillsArray.set([...profile.skills]);
    this.expertiseArray.set([...profile.expertise]);
    this.careerInterestsArray.set([...profile.careerInterests]);
    this.mentorshipAreasArray.set([...profile.mentorshipAreas]);
    this.profileForm.markAsPristine();
  }

  addSkill(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && !this.skillsArray().includes(value)) {
      this.skillsArray.update(arr => [...arr, value]);
      this.profileForm.markAsDirty();
    }
    input.value = '';
  }

  removeSkill(skill: string): void {
    this.skillsArray.update(arr => arr.filter(s => s !== skill));
    this.profileForm.markAsDirty();
  }

  addExpertise(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && !this.expertiseArray().includes(value)) {
      this.expertiseArray.update(arr => [...arr, value]);
      this.profileForm.markAsDirty();
    }
    input.value = '';
  }

  removeExpertise(exp: string): void {
    this.expertiseArray.update(arr => arr.filter(e => e !== exp));
    this.profileForm.markAsDirty();
  }

  addCareerInterest(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && !this.careerInterestsArray().includes(value)) {
      this.careerInterestsArray.update(arr => [...arr, value]);
      this.profileForm.markAsDirty();
    }
    input.value = '';
  }

  removeCareerInterest(interest: string): void {
    this.careerInterestsArray.update(arr => arr.filter(i => i !== interest));
    this.profileForm.markAsDirty();
  }

  addMentorshipArea(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && !this.mentorshipAreasArray().includes(value)) {
      this.mentorshipAreasArray.update(arr => [...arr, value]);
      this.profileForm.markAsDirty();
    }
    input.value = '';
  }

  removeMentorshipArea(area: string): void {
    this.mentorshipAreasArray.update(arr => arr.filter(a => a !== area));
    this.profileForm.markAsDirty();
  }

  resetForm(): void {
    if (this.profile()) {
      this.patchForm(this.profile()!);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.saving()) return;

    this.saving.set(true);
    const formValue = this.profileForm.value;
    const payload: Partial<AlumniProfile> = {
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      bio: formValue.bio || undefined,
      currentRole: formValue.currentRole!,
      company: formValue.company!,
      experienceYears: formValue.experienceYears!,
      skills: this.skillsArray(),
      expertise: this.expertiseArray(),
      careerInterests: this.careerInterestsArray(),
      mentorshipAreas: this.mentorshipAreasArray(),
    };

    this.alumniService.updateProfile(payload).subscribe({
      next: () => {
        this.toast.success('Profile Updated', 'Your profile has been saved successfully.');
        this.profileForm.markAsPristine();
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error('Save Failed', err.error?.message || 'Failed to update profile');
        this.saving.set(false);
      }
    });
  }

  toPreviewData(profile: AlumniProfile): ProfileCardData {
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      role: 'ALUMNI',
      bio: profile.bio,
      currentRole: profile.currentRole,
      company: profile.company,
      experienceYears: profile.experienceYears,
      skills: profile.skills,
      expertise: profile.expertise,
      mentorshipAreas: profile.mentorshipAreas,
      verificationStatus: profile.verificationStatus,
      averageRating: profile.averageRating,
      totalReviews: profile.totalReviews,
    };
  }

  getVerificationVariant(): 'success' | 'warning' | 'default' {
    const status = this.profile()?.verificationStatus;
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  }
}