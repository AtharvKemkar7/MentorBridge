import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ab-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="app-footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#e67e22"/>
              <path d="M8 16L14 22L24 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>AlumniBridge</span>
          </div>
          <nav class="footer-links" aria-label="Footer navigation">
            <a routerLink="/login">Sign In</a>
            <a routerLink="/register">Register</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ year }} AlumniBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-grid { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
    .footer-brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.125rem; color: #ecf0f1; }
    .footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .footer-links a { color: #adb5bd; font-size: 0.875rem; transition: color 0.2s; }
    .footer-links a:hover { color: #e67e22; text-decoration: none; }
    .footer-bottom { padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.75rem; color: #6c757d; }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}