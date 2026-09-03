import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ab-alumni-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <h1 class="page-title">Alumni Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ auth.user()?.firstName }}!</p>
      </header>

      <div class="dashboard-grid">
        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Mentorship Requests</h2>
            <a routerLink="/alumni/requests" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No new mentorship requests.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Upcoming Sessions</h2>
            <a routerLink="/alumni/sessions" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No upcoming sessions scheduled.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Active Mentees</h2>
            <a routerLink="/alumni/mentees" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No active mentees yet.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Availability</h2>
            <a routerLink="/alumni/availability" class="section-link">Manage</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>Set your availability to receive booking requests.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Notifications</h2>
            <a routerLink="/alumni/notifications" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No new notifications.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e9ecef; }
    .section-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .section-link { font-size: 0.875rem; font-weight: 500; color: #2c3e50; }
    .placeholder-state { padding: 2rem 1rem; text-align: center; color: #6c757d; }
    .placeholder-state a { font-weight: 500; }
    .placeholder-state p { margin: 0; }
  `]
})
export class AlumniDashboardComponent {
  auth = inject(AuthService);
}