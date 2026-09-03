import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminDashboardStats } from '../../../core/services/admin.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'ab-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ErrorStateComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-subtitle">System overview and management</p>
      </header>

      @if (loading()) {
        <ab-loading-spinner [overlay]="true" [size]="48" />
      } @else if (error()) {
        <ab-error-state [message]="error()!" (retry)="load()" />
      } @else {
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">✓</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.pendingVerifications ?? 0 }}</span>
              <span class="stat-label">Pending Verifications</span>
            </div>
            <a routerLink="/admin/verifications" class="stat-link">Review</a>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalStudents ?? 0 }}</span>
              <span class="stat-label">Total Students</span>
            </div>
            <a routerLink="/admin/users" class="stat-link">Manage</a>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">🎓</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalAlumni ?? 0 }}</span>
              <span class="stat-label">Total Alumni</span>
            </div>
            <a routerLink="/admin/users" class="stat-link">Manage</a>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">🤝</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.activeMentorships ?? 0 }}</span>
              <span class="stat-label">Active Mentorships</span>
            </div>
            <a routerLink="/admin/mentorship" class="stat-link">View</a>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">📨</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.pendingMentorshipRequests ?? 0 }}</span>
              <span class="stat-label">Pending Requests</span>
            </div>
            <a routerLink="/admin/mentorship" class="stat-link">View</a>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.recentReviews ?? 0 }}</span>
              <span class="stat-label">Recent Reviews</span>
            </div>
            <a routerLink="/admin/reviews" class="stat-link">View</a>
          </div>
        </div>

        <div class="dashboard-grid">
          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">Recent Activity</h2>
              <a routerLink="/admin/audit-logs" class="section-link">View All</a>
            </header>
            <div class="section-content">
              @if (recentActivity().length) {
                <div class="activity-list">
                  @for (item of recentActivity(); track item.id) {
                    <div class="activity-item">
                      <div class="activity-time">{{ formatDateTime(item.timestamp) }}</div>
                      <div class="activity-details">
                        <strong>{{ item.action }}</strong> by {{ item.actor }}
                        <span class="activity-meta">{{ item.details }}</span>
                      </div>
                      <ab-status-badge [label]="item.status" [variant]="item.status === 'SUCCESS' ? 'success' : 'danger'" [dot]="true" />
                    </div>
                  }
                </div>
              } @else {
                <ab-empty-state title="No Recent Activity" message="Activity will appear here." />
              }
            </div>
          </section>

          <section class="card dashboard-section">
            <header class="section-header">
              <h2 class="section-title">System Health</h2>
            </header>
            <div class="section-content">
              @if (systemHealth()) {
                <div class="health-grid">
                  @for (svc of systemHealth()!.services; track svc.name) {
                    <div class="health-item">
                      <div class="health-name">{{ svc.name }}</div>
                      <ab-status-badge [label]="svc.status" [variant]="svc.status === 'UP' ? 'success' : 'danger'" [dot]="true" />
                      @if (svc.latencyMs !== undefined) {
                        <div class="health-latency">{{ svc.latencyMs }} ms</div>
                      }
                    </div>
                  }
                </div>
                <div class="overall-status" [class.healthy]="systemHealth()?.status === 'HEALTHY'" [class.degraded]="systemHealth()?.status === 'DEGRADED'" [class.down]="systemHealth()?.status === 'DOWN'">
                  Overall: {{ systemHealth()?.status }}
                </div>
              } @else {
                <ab-empty-state title="Health Data Unavailable" message="Unable to load system health." />
              }
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 1.5rem; }
    .page-header { margin-bottom: 2rem; }
    .page-title { margin: 0 0 0.25rem; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; position: relative; background: #fff; border: 1px solid #e9ecef; border-radius: 0.75rem; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(44,62,80,0.1); color: #2c3e50; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .stat-info { flex: 1; }
    .stat-value { display: block; font-size: 1.75rem; font-weight: 700; color: #2c3e50; line-height: 1.2; }
    .stat-label { font-size: 0.875rem; color: #6c757d; }
    .stat-link { position: absolute; inset: 0; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
    .card { background: #fff; border: 1px solid #e9ecef; border-radius: 0.75rem; overflow: hidden; }
    .section-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid #e9ecef; }
    .section-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .section-link { font-size: 0.875rem; font-weight: 500; color: #2c3e50; text-decoration: none; }
    .section-link:hover { text-decoration: underline; }
    .section-content { padding: 1rem 1.25rem; }
    .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .activity-item { display: flex; align-items: flex-start; gap: 1rem; padding: 0.75rem; background: #f8f9fa; border-radius: 0.5rem; }
    .activity-time { font-size: 0.75rem; color: #6c757d; white-space: nowrap; min-width: 130px; }
    .activity-details { flex: 1; min-width: 0; }
    .activity-details strong { display: block; color: #2c3e50; }
    .activity-meta { display: block; font-size: 0.8125rem; color: #6c757d; margin-top: 0.25rem; }
    .health-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .health-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; text-align: center; }
    .health-name { font-weight: 500; color: #2c3e50; }
    .health-latency { font-size: 0.75rem; color: #6c757d; }
    .overall-status { padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; text-align: center; }
    .overall-status.healthy { background: #d4edda; color: #155724; }
    .overall-status.degraded { background: #fff3cd; color: #856404; }
    .overall-status.down { background: #f8d7da; color: #721c24; }
    @media (max-width: 768px) {
      .dashboard { padding: 1rem; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  error = signal<string | null>(null);
  stats = signal<AdminDashboardStats | null>(null);
  recentActivity = signal<AdminDashboardStats['recentActivity']>([]);
  systemHealth = signal<AdminDashboardStats['systemHealth'] | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.recentActivity.set(data.recentActivity ?? []);
        this.systemHealth.set(data.systemHealth ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load dashboard');
        this.loading.set(false);
      }
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}