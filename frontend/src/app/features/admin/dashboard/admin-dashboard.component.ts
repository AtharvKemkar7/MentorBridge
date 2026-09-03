import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ab-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-subtitle">System overview and management</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon">✓</div>
          <div class="stat-info">
            <span class="stat-value">--</span>
            <span class="stat-label">Pending Verifications</span>
          </div>
          <a routerLink="/admin/verifications" class="stat-link">Review</a>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <span class="stat-value">--</span>
            <span class="stat-label">Total Students</span>
          </div>
          <a routerLink="/admin/students" class="stat-link">Manage</a>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🎓</div>
          <div class="stat-info">
            <span class="stat-value">--</span>
            <span class="stat-label">Total Alumni</span>
          </div>
          <a routerLink="/admin/alumni" class="stat-link">Manage</a>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">🤝</div>
          <div class="stat-info">
            <span class="stat-value">--</span>
            <span class="stat-label">Active Mentorships</span>
          </div>
          <a routerLink="/admin/mentorships" class="stat-link">View</a>
        </div>
      </div>

      <div class="dashboard-grid">
        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Pending Alumni Verifications</h2>
            <a routerLink="/admin/verifications" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No pending verifications at this time.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Recent Mentorship Activity</h2>
            <a routerLink="/admin/mentorships" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No recent activity to display.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">Reports & Moderation</h2>
            <a routerLink="/admin/reports" class="section-link">View All</a>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>No reports requiring attention.</p>
            </div>
          </div>
        </section>

        <section class="card dashboard-section">
          <header class="section-header">
            <h2 class="section-title">System Overview</h2>
          </header>
          <div class="section-content">
            <div class="placeholder-state">
              <p>System health metrics will be displayed here.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; position: relative; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(44,62,80,0.1); color: #2c3e50; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .stat-info { flex: 1; }
    .stat-value { display: block; font-size: 1.75rem; font-weight: 700; color: #2c3e50; line-height: 1.2; }
    .stat-label { font-size: 0.875rem; color: #6c757d; }
    .stat-link { position: absolute; inset: 0; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e9ecef; }
    .section-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .section-link { font-size: 0.875rem; font-weight: 500; color: #2c3e50; }
    .placeholder-state { padding: 2rem 1rem; text-align: center; color: #6c757d; }
    .placeholder-state p { margin: 0; }
  `]
})
export class AdminDashboardComponent {
  auth = inject(AuthService);
}