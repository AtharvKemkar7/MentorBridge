import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'ab-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <h2>AlumniBridge Admin</h2>
          <button class="toggle-btn" (click)="sidebarCollapsed = !sidebarCollapsed" aria-label="Toggle sidebar">
            <span class="material-icons">{{ sidebarCollapsed ? 'chevron_right' : 'chevron_left' }}</span>
          </button>
        </div>
        <nav class="sidebar-nav">
          <ul>
            <li *ngFor="let item of navItems">
              <a [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="onNavClick()">
                <span class="material-icons">{{ item.icon }}</span>
                <span *ngIf="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </nav>
        <div class="sidebar-footer" *ngIf="!sidebarCollapsed">
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </aside>
      <div class="main-content" [class.sidebar-collapsed]="sidebarCollapsed">
        <header class="top-bar">
          <div class="page-title">{{ currentTitle }}</div>
          <div class="user-menu">
            <span class="user-name">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</span>
          </div>
        </header>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; background: #f5f6fa; }
    .sidebar { width: 260px; background: #2c3e50; color: #fff; display: flex; flex-direction: column; transition: width .3s; z-index: 10; }
    .sidebar.collapsed { width: 72px; }
    .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .sidebar-header h2 { margin: 0; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sidebar.collapsed .sidebar-header h2 { display: none; }
    .toggle-btn { background: none; border: none; color: #fff; cursor: pointer; padding: 0.25rem; }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: 1rem 0; }
    .sidebar-nav ul { list-style: none; margin: 0; padding: 0; }
    .sidebar-nav li { margin: 0; }
    .sidebar-nav a { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: rgba(255,255,255,0.8); text-decoration: none; transition: background .2s, color .2s; white-space: nowrap; }
    .sidebar-nav a:hover, .sidebar-nav a.active { background: rgba(255,255,255,0.1); color: #fff; }
    .sidebar.collapsed .nav-label { display: none; }
    .sidebar-nav .material-icons { font-size: 1.25rem; flex-shrink: 0; }
    .sidebar-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
    .btn-logout { width: 100%; padding: 0.6rem; background: #e74c3c; color: #fff; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500; }
    .btn-logout:hover { background: #c0392b; }
    .main-content { flex: 1; display: flex; flex-direction: column; transition: margin-left .3s; min-width: 0; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; background: #fff; border-bottom: 1px solid #e9ecef; position: sticky; top: 0; z-index: 5; }
    .page-title { font-size: 1.25rem; font-weight: 600; color: #2c3e50; }
    .user-menu .user-name { font-size: 0.875rem; color: #6c757d; }
    .content-area { flex: 1; padding: 1.5rem; overflow-y: auto; }
    @media (max-width: 768px) {
      .sidebar { position: fixed; left: 0; top: 0; height: 100vh; transform: translateX(-100%); box-shadow: 2px 0 8px rgba(0,0,0,0.15); }
      .sidebar.open { transform: translateX(0); }
      .main-content { margin-left: 0; }
    }
  `]
})
export class AdminLayoutComponent {
  sidebarCollapsed = false;
  auth = inject(AuthService);
  router = inject(Router);

  navItems = [
    { route: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { route: '/admin/verifications', label: 'Verifications', icon: 'verified_user' },
    { route: '/admin/users', label: 'Users', icon: 'people' },
    { route: '/admin/mentorship', label: 'Mentorship', icon: 'groups' },
    { route: '/admin/categories', label: 'Categories', icon: 'category' },
    { route: '/admin/reviews', label: 'Reviews', icon: 'rate_review' },
    { route: '/admin/audit-logs', label: 'Audit Logs', icon: 'history' },
    { route: '/admin/settings', label: 'Settings', icon: 'settings' },
  ];

  get currentTitle(): string {
    const url = this.router.url;
    const match = this.navItems.find(i => url.startsWith(i.route));
    return match ? match.label : 'Admin';
  }

  onNavClick(): void {
    // On mobile close sidebar after click
    if (window.innerWidth <= 768) {
      // Could implement mobile toggle state if needed
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

// Need to import inject from @angular/core