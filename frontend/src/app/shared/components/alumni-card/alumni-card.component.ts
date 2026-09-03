import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { RatingDisplayComponent } from '../rating-display/rating-display.component';

export interface AlumniCardData {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  currentRole: string;
  company: string;
  experienceYears: number;
  skills: string[];
  expertise: string[];
  mentorshipAreas: string[];
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  averageRating?: number;
  totalReviews?: number;
}

@Component({
  selector: 'ab-alumni-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, RatingDisplayComponent],
  template: `
    <article class="alumni-card" [class.compact]="compact()">
      <div class="card-header">
        <div class="avatar-wrapper">
          @if (alumni().avatarUrl) {
            <img [src]="alumni().avatarUrl" [alt]="alumni().firstName + ' ' + alumni().lastName" class="avatar" />
          } @else {
            <div class="avatar placeholder" [innerHTML]="initials()"></div>
          }
          @if (alumni().verificationStatus === 'VERIFIED') {
            <span class="verification-badge" title="Verified Alumni">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </span>
          }
        </div>
        <div class="name-section">
          <h3 class="name">{{ alumni().firstName }} {{ alumni().lastName }}</h3>
          <div class="meta">
            <span class="role">{{ alumni().currentRole }}</span>
            <span class="separator" aria-hidden="true">•</span>
            <span class="company">{{ alumni().company }}</span>
          </div>
        </div>
        <div class="availability">
          <ab-status-badge [label]="alumni().availabilityStatus" [variant]="getAvailabilityVariant()" [dot]="true" />
        </div>
      </div>

      <div class="card-body">
        <div class="experience">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>{{ alumni().experienceYears }} years experience</span>
        </div>

        @if (!compact()) {
          <div class="skills">
            @for (skill of displayedSkills(); track skill) {
              <span class="skill-tag">{{ skill }}</span>
            }
            @if (alumni().skills.length > maxSkills()) {
              <span class="skill-tag more">+{{ alumni().skills.length - maxSkills() }}</span>
            }
          </div>

          <div class="expertise">
            <span class="section-label">Expertise:</span>
            @for (exp of displayedExpertise(); track exp) {
              <span class="expertise-tag">{{ exp }}</span>
            }
          </div>

          <div class="mentorship-areas">
            <span class="section-label">Mentorship:</span>
            @for (area of displayedMentorshipAreas(); track area) {
              <span class="area-tag">{{ area }}</span>
            }
          </div>
        }
      </div>

      <div class="card-footer">
        @if (showRating() && alumni().averageRating !== undefined) {
          <ab-rating-display [value]="alumni().averageRating!" [count]="alumni().totalReviews" [showValue]="true" [showCount]="true" [readonly]="true" [size]="'sm'" />
        }
        <div class="actions">
          <a [routerLink]="['/student/alumni', alumni().id]" class="btn-secondary btn-sm">View Profile</a>
          @if (showRequestButton()) {
            <button type="button" class="btn-primary btn-sm" (click)="requestMentorship.emit(alumni().id)">Request Mentorship</button>
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    .alumni-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .alumni-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border-color: #dee2e6;
    }
    .alumni-card.compact .card-body { display: none; }
    .alumni-card.compact .card-footer { border-top: 1px solid #e9ecef; }
    
    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
    }
    .avatar-wrapper { position: relative; flex-shrink: 0; }
    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
    }
    .avatar.placeholder {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2c3e50, #1a252f);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .verification-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: #28a745;
      border: 2px solid #fff;
      border-radius: 50%;
      color: #fff;
    }
    .name-section { flex: 1; min-width: 0; }
    .name { margin: 0 0 0.25rem; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .meta { display: flex; align-items: center; flex-wrap: wrap; gap: 0.375rem; font-size: 0.8125rem; color: #6c757d; }
    .role { font-weight: 500; color: #495057; }
    .separator { color: #dee2e6; }
    .availability { flex-shrink: 0; }
    
    .card-body { padding: 0 1.25rem 1rem; }
    .experience { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #6c757d; margin-bottom: 0.75rem; }
    .skills, .expertise, .mentorship-areas { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin-bottom: 0.75rem; }
    .section-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6c757d; }
    .skill-tag, .expertise-tag, .area-tag {
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      background: #f8f9fa;
      color: #495057;
      border: 1px solid #e9ecef;
    }
    .skill-tag.more { background: #e9ecef; color: #6c757d; }
    
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }
    .actions { display: flex; align-items: center; gap: 0.5rem; }
    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn-primary { color: #fff; background: #2c3e50; }
    .btn-primary:hover { background: #1a252f; }
    .btn-secondary { color: #495057; background: #fff; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
  `]
})
export class AlumniCardComponent {
  alumni = input.required<AlumniCardData>();
  compact = input(false);
  showRating = input(true);
  showRequestButton = input(false);
  maxSkills = input(4);
  maxExpertise = input(3);
  maxMentorshipAreas = input(3);

  requestMentorship = output<string>();

  initials = computed(() => {
    const a = this.alumni();
    return (a.firstName[0] + a.lastName[0]).toUpperCase();
  });

  displayedSkills = computed(() => this.alumni().skills.slice(0, this.maxSkills()));
  displayedExpertise = computed(() => this.alumni().expertise.slice(0, this.maxExpertise()));
  displayedMentorshipAreas = computed(() => this.alumni().mentorshipAreas.slice(0, this.maxMentorshipAreas()));

  getAvailabilityVariant(): 'success' | 'warning' | 'default' {
    switch (this.alumni().availabilityStatus) {
      case 'AVAILABLE': return 'success';
      case 'BUSY': return 'warning';
      default: return 'default';
    }
  }
}