import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ab-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-state" [class.centered]="centered()">
      <div class="error-state-icon" [innerHTML]="icon()"></div>
      <h3 class="error-state-title">{{ title() }}</h3>
      <p class="error-state-message">{{ message() }}</p>
      @if (showRetry()) {
        <button type="button" class="error-state-retry btn-primary" (click)="retry.emit()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          Try Again
        </button>
      }
    </div>
  `,
  styles: [`
    .error-state {
      padding: 3rem 1.5rem;
      text-align: center;
      color: #6c757d;
    }
    .error-state.centered {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }
    .error-state-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      color: #f8d7da;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .error-state-icon svg {
      width: 100%;
      height: 100%;
    }
    .error-state-title {
      margin: 0 0 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #dc3545;
    }
    .error-state-message {
      margin: 0 0 1.5rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .error-state-retry {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      color: #fff;
      background: #dc3545;
      transition: background 0.2s ease;
    }
    .error-state-retry:hover {
      background: #c82333;
    }
  `]
})
export class ErrorStateComponent {
  icon = input<string>(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`);
  title = input('Something Went Wrong');
  message = input('An unexpected error occurred. Please try again later.');
  showRetry = input(true);
  centered = input(true);
  retry = output<void>();
}