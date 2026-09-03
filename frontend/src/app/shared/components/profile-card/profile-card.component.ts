import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { RatingDisplayComponent } from '../rating-display/rating-display.component';

export interface ProfileCardData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  bio?: string;
  currentRole?: string;
  company?: string;
  experienceYears?: number;
  skills?: string[];
  expertise?: string[];
  mentorshipAreas?: string[];
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  averageRating?: number;
  totalReviews?: number;
}

@Component({
  selector: 'ab-profile-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, RatingDisplayComponent],
  template: `
    <div class="profile-card" [class.detailed]="detailed()">
      <div class="card-header">
        <div class="avatar-wrapper">
          @if (profile().avatarUrl) {
            <img [src]="profile().avatarUrl" [alt]="profile().firstName + ' ' + profile().lastName" class="avatar" />
          } @else {
            <div class="avatar placeholder" [innerHTML]="initials()"></div>
          }
          @if (profile().verificationStatus === 'VERIFIED') {
            <span class="verification-badge" title="Verified">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </span>
          }
        </div>
        <div class="info">
          <h2 class="name">{{ profile().firstName }} {{ profile().lastName }}</h2>
          <div class="badges">
            <ab-status-badge [label]="profile().role" [variant]="getRoleVariant()" [dot]="true" />
            @if (profile().verificationStatus) {
              <ab-status-badge [label]="profile().verificationStatus" [variant]="getVerificationVariant()" />
            }
          </div>
          <p class="email">{{ profile().email }}</p>
        </div>
      </div>

      @if (detailed()) {
        <div class="card-divider"></div>
        <div class="card-body">
          @if (profile().bio) {
            <div class="bio">{{ profile().bio }}</div>
          }
          @if (profile().currentRole || profile().company) {
            <div class="current-position">
              @if (profile().currentRole) {
                <span class="role">{{ profile().currentRole }}</span>
              }
              @if (profile().company) {
                <span class="separator" aria-hidden="true">•</span>
                <span class="company">{{ profile().company }}</span>
              }
              @if (profile().experienceYears !== undefined) {
                <span class="separator" aria-hidden="true">•</span>
                <span class="experience">{{ profile().experienceYears }} years experience</span>
              }
            </div>
          }
          @if (profile().skills && profile().skills.length) {
            <div class="skills-section">
              <h4 class="section-title">Skills</h4>
              <div class="tags">
                @for (skill of profile().skills!; track skill) {
                  <span class="tag">{{ skill }}</span>
                }
              </div>
            </div>
          }
          @if (profile().expertise && profile().expertise.length) {
            <div class="expertise-section">
              <h4 class="section-title">Expertise</h4>
              <div class="tags">
                @for (exp of profile().expertise!; track exp) {
                  <span class="tag">{{ exp }}</span>
                }
              </div>
            </div>
          }
          @if (profile().mentorshipAreas && profile().mentorshipAreas.length) {
            <div class="mentorship-section">
              <h4 class="section-title">Mentorship Areas</h4>
              <div class="tags">
                @for (area of profile().mentorshipAreas!; track area) {
                  <span class="tag">{{ area }}</span>
                }
              </div>
            </div>
          }
          @if (profile().averageRating !== undefined) {
            <div class="rating-section">
              <h4 class="section-title">Rating</h4>
              <ab-rating-display [value]="profile().averageRating!" [count]="profile().totalReviews" [showValue]="true" [showCount]="true" [readonly]="true" [size]="'md'" />
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      overflow: hidden;
    }
    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
    }
    .avatar-wrapper { position: relative; flex-shrink: 0; }
    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
    }
    .avatar.placeholder {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2c3e50, #1a252f);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 600;
    }
    .verification-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #28a745;
      border: 3px solid #fff;
      border-radius: 50%;
      color: #fff;
    }
    .info { flex: 1; min-width: 0; }
    .name { margin: 0 0 0.5rem; font-size: 1.5rem; font-weight: 600; color: #2c3e50; }
    .badges { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
    .email { margin: 0; font-size: 0.9375rem; color: #6c757d; }
    .card-divider { height: 1px; background: #e9ecef; }
    .card-body { padding: 1.5rem; }
    .bio { margin-bottom: 1.5rem; font-size: 0.9375rem; line-height: 1.6; color: #495057; }
    .current-position { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9375rem; }
    .role { font-weight: 600; color: #2c3e50; }
    .company { color: #495057; }
    .experience { color: #6c757d; }
    .separator { color: #dee2e6; }
    .section-title { margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.05em; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag { padding: 0.375rem 0.75rem; font-size: 0.8125rem; font-weight: 500; background: #f8f9fa; color: #495057; border: 1px solid #e9ecef; border-radius: 0.375rem; }
    .rating-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e9ecef; }
  `]
})
export class ProfileCardComponent {
  profile = input.required<ProfileCardData>();
  detailed = input(true);

  initials = computed(() => {
    const p = this.profile();
    return (p.firstName[0] + p.lastName[0]).toUpperCase();
  });

  getRoleVariant(): 'primary' | 'success' | 'warning' {
    switch (this.profile().role) {
      case 'STUDENT': return 'primary';
      case 'ALUMNI': return 'success';
      case 'ADMIN': return 'warning';
    }
  }

  getVerificationVariant(): 'success' | 'warning' | 'default' {
    switch (this.profile().verificationStatus) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  }
}