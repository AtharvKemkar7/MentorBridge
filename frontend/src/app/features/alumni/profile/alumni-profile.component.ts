import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ab-alumni-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-page">
      <header class="page-header">
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">Manage your alumni profile and mentorship settings</p>
      </header>

      <div class="profile-grid">
        <section class="card profile-section">
          <h2 class="section-title">Basic Information</h2>
          <div class="placeholder-state">
            <p>Profile editing will be available once the Profile Service API is connected.</p>
            <div class="info-display">
              <dl>
                <dt>Name</dt><dd>{{ auth.user()?.firstName }} {{ auth.user()?.lastName }}</dd>
                <dt>Email</dt><dd>{{ auth.user()?.email }}</dd>
                <dt>Role</dt><dd>{{ auth.user()?.role }}</dd>
                <dt>User ID</dt><dd>{{ auth.user()?.id }}</dd>
              </dl>
            </div>
          </div>
        </section>

        <section class="card profile-section">
          <h2 class="section-title">Professional Information</h2>
          <div class="placeholder-state">
            <p>Professional profile (company, role, industry, experience) will be loaded from the Profile Service.</p>
          </div>
        </section>

        <section class="card profile-section">
          <h2 class="section-title">Expertise & Availability</h2>
          <div class="placeholder-state">
            <p>Expertise areas and mentorship availability management coming soon.</p>
          </div>
        </section>

        <section class="card profile-section">
          <h2 class="section-title">Notification Preferences</h2>
          <div class="placeholder-state">
            <p><a routerLink="/notification-preferences">Manage notification preferences</a></p>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .profile-section { min-height: 200px; }
    .section-title { margin: 0 0 1rem; font-size: 1.125rem; font-weight: 600; color: #2c3e50; padding-bottom: 0.75rem; border-bottom: 1px solid #e9ecef; }
    .placeholder-state { padding: 1.5rem; color: #6c757d; }
    .placeholder-state a { font-weight: 500; }
    .info-display dl { display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem 1rem; margin: 0; font-size: 0.875rem; }
    .info-display dt { color: #6c757d; font-weight: 500; }
    .info-display dd { margin: 0; color: #2c3e50; word-break: break-word; }
  `]
})
export class AlumniProfileComponent {
  auth = inject(AuthService);
}