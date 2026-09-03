import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ab-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner-container" [class.overlay]="overlay()" [class.inline]="!overlay()">
      <div class="spinner" [style.width.px]="size()" [style.height.px]="size()"></div>
      @if (message()) {
        <p class="loading-message">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    .loading-spinner-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      z-index: 1000;
      backdrop-filter: blur(2px);
    }
    .spinner {
      border: 3px solid #e9ecef;
      border-top-color: #2c3e50;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .loading-message {
      margin: 0;
      color: #6c757d;
      font-size: 0.875rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  size = input(40);
  message = input<string>('');
  overlay = input(false);
}