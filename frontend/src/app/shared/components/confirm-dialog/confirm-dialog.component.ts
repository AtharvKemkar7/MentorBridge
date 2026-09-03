import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ab-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open()) {
      <div class="dialog-overlay" (click)="onOverlayClick($event)"></div>
      <div class="dialog-container" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-message">
        <header class="dialog-header">
          <h2 id="dialog-title" class="dialog-title">{{ title() }}</h2>
          <button type="button" class="dialog-close" (click)="cancel.emit()" aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>
        <div class="dialog-content">
          <p id="dialog-message" class="dialog-message">{{ message() }}</p>
          @if (details()) {
            <p class="dialog-details">{{ details() }}</p>
          }
        </div>
        <footer class="dialog-footer">
          <button type="button" class="btn-secondary" (click)="cancel.emit()">{{ cancelLabel() }}</button>
          <button type="button" class="btn-danger" (click)="confirm.emit()" [disabled]="loading()">
            @if (loading()) {
              <span class="btn-spinner"></span>
            }
            {{ confirmLabel() }}
          </button>
        </footer>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    .dialog-container {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 0.75rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      animation: slideUp 0.2s ease;
      overflow: hidden;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }
    .dialog-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #2c3e50;
    }
    .dialog-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 0.375rem;
      color: #6c757d;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .dialog-close:hover {
      background: #f8f9fa;
      color: #2c3e50;
    }
    .dialog-content {
      padding: 1.5rem;
    }
    .dialog-message {
      margin: 0 0 0.75rem;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: #2c3e50;
    }
    .dialog-details {
      margin: 0;
      font-size: 0.8125rem;
      color: #6c757d;
    }
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }
    .btn-secondary, .btn-danger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-secondary {
      color: #495057;
      background: #fff;
      border: 1px solid #dee2e6;
    }
    .btn-secondary:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #ced4da;
    }
    .btn-danger {
      color: #fff;
      background: #dc3545;
    }
    .btn-danger:hover:not(:disabled) {
      background: #c82333;
    }
    .btn-danger:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translate(-50%, -45%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ConfirmDialogComponent {
  open = input.required<boolean>();
  title = input('Confirm Action');
  message = input('Are you sure you want to proceed?');
  details = input<string>('');
  confirmLabel = input('Confirm');
  cancelLabel = input('Cancel');
  loading = input(false);
  variant = input<'danger' | 'primary'>('danger');
  
  confirm = output<void>();
  cancel = output<void>();

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }
}