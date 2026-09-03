import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ab-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="empty-state" [class.centered]="centered()">
      <div class="empty-state-icon" [innerHTML]="icon()"></div>
      <h3 class="empty-state-title">{{ title() }}</h3>
      <p class="empty-state-message">{{ message() }}</p>
      @if (actionLabel() && actionRoute()) {
        <a [routerLink]="actionRoute()" class="empty-state-action">{{ actionLabel() }}</a>
      }
      @if (actionLabel() && actionClick()) {
        <button type="button" class="empty-state-action btn-primary" (click)="actionClick()!($event)">{{ actionLabel() }}</button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      padding: 3rem 1.5rem;
      text-align: center;
      color: #6c757d;
    }
    .empty-state.centered {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }
    .empty-state-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      color: #dee2e6;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .empty-state-icon svg {
      width: 100%;
      height: 100%;
    }
    .empty-state-title {
      margin: 0 0 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #2c3e50;
    }
    .empty-state-message {
      margin: 0 0 1.5rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .empty-state-action {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      text-decoration: none;
      color: #fff;
      background: #2c3e50;
      transition: background 0.2s ease;
    }
    .empty-state-action:hover {
      background: #1a252f;
    }
  `]
})
export class EmptyStateComponent {
  icon = input<string>(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>`);
  title = input('No Data');
  message = input('There is nothing to display at the moment.');
  actionLabel = input<string>('');
  actionRoute = input<string>('');
  actionClick = input<(() => void) | null>(null);
  centered = input(true);
}