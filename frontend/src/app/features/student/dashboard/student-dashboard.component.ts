import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ab-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <h1 class="page-title">Student Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ auth.user()?.firstName }}!</p>
      </header>

      <div class="dashboard-grid">
        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">My Mentors</h2>
            <a routerLink="/student/mentors" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No mentors yet. <a routerLink="/student/discover">Discover alumni</a> to find mentors.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Upcoming Sessions</h2>
            <a routerLink="/student/sessions" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No upcoming sessions. <a routerLink="/student/book">Book a session</a> with your mentor.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Pending Requests</h2>
            <a routerLink="/student/requests" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No pending mentorship requests.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Recommended Alumni</h2>
            <a routerLink="/student/discover" class="section-link">Browse All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>Complete your profile to get personalized recommendations.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Recent Notifications</h2>
            <a routerLink="/student/notifications" class="section-link">View All</a>
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
export class StudentDashboardComponent {
  auth = inject(AuthService);
}