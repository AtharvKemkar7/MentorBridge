import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'ab-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-header" role="banner">
      <div class="header-inner container">
        <a routerLink="/" class="header-brand" aria-label="AlumniBridge Home">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" style="margin-right:8px;vertical-align:middle;">
            <rect width="32" height="32" rx="8" fill="#2c3e50"/>
            <path d="M8 16L14 22L24 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          AlumniBridge
        </a>

        <nav class="header-nav" aria-label="Main navigation" *ngIf="auth.isAuthenticated()">
          @if (auth.userRole() === 'STUDENT') {
            <a routerLink="/student/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/student/profile" routerLinkActive="active">Profile</a>
          }
          @if (auth.userRole() === 'ALUMNI') {
            <a routerLink="/alumni/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/alumni/profile" routerLinkActive="active">Profile</a>
          }
          @if (auth.userRole() === 'ADMIN') {
            <a routerLink="/admin/dashboard" routerLinkActive="active">Admin</a>
          }
        </nav>

        <div class="header-user" *ngIf="auth.isAuthenticated()">
          <div class="user-avatar">{{ initials() }}</div>
          <span class="user-name">{{ auth.user()?.firstName }}</span>
          <button type="button" class="btn-secondary" (click)="logout()" aria-label="Sign out">Logout</button>
        </div>

        <div class="header-actions" *ngIf="!auth.isAuthenticated()">
          <a routerLink="/login" class="btn-secondary">Sign In</a>
          <a routerLink="/register" class="btn-primary">Get Started</a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header-actions { display: flex; gap: 0.5rem; align-items: center; }
    .header-nav a.active { background: #e8edf2; color: #2c3e50; }
    .user-name { font-weight: 500; color: #2c3e50; }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  initials = computed(() => {
    const u = this.auth.user();
    if (!u) return '';
    return (u.firstName?.[0] || '') + (u.lastName?.[0] || '');
  });

  logout(): void {
    this.auth.logout();
  }
}