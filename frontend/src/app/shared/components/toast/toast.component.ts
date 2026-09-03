import { Component, signal, computed, effect, inject, OnDestroy, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; callback: () => void };
}

@Component({
  selector: 'ab-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" [class]="'position-' + position()">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" [class]="'type-' + toast.type" role="alert" aria-live="polite">
          <div class="toast-icon" [innerHTML]="getIcon(toast.type)"></div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            @if (toast.message) {
              <div class="toast-message">{{ toast.message }}</div>
            }
          </div>
          <button type="button" class="toast-close" (click)="remove(toast.id)" aria-label="Dismiss">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          @if (toast.action) {
            <button type="button" class="toast-action" (click)="executeAction(toast)">
              {{ toast.action.label }}
            </button>
          }
          <div class="toast-progress" [style.animation-duration]="(toast.duration || 5000) + 'ms'"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      pointer-events: none;
      max-width: 400px;
      width: 100%;
    }
    .position-top-right { top: 0; right: 0; align-items: flex-end; }
    .position-top-left { top: 0; left: 0; align-items: flex-start; }
    .position-bottom-right { bottom: 0; right: 0; align-items: flex-end; }
    .position-bottom-left { bottom: 0; left: 0; align-items: flex-start; }
    .position-top-center { top: 0; left: 50%; transform: translateX(-50%); align-items: center; }
    .position-bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); align-items: center; }
    
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      animation: slideIn 0.3s ease;
      position: relative;
      overflow: hidden;
      min-width: 300px;
      max-width: 100%;
    }
    .toast.type-success { border-left: 4px solid #28a745; }
    .toast.type-error { border-left: 4px solid #dc3545; }
    .toast.type-warning { border-left: 4px solid #ffc107; }
    .toast.type-info { border-left: 4px solid #17a2b8; }
    
    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      color: inherit;
    }
    .type-success .toast-icon { color: #28a745; }
    .type-error .toast-icon { color: #dc3545; }
    .type-warning .toast-icon { color: #ffc107; }
    .type-info .toast-icon { color: #17a2b8; }
    
    .toast-content {
      flex: 1;
      min-width: 0;
    }
    .toast-title {
      font-weight: 600;
      font-size: 0.9375rem;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }
    .toast-message {
      font-size: 0.8125rem;
      color: #6c757d;
      line-height: 1.4;
    }
    .toast-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      border-radius: 0.25rem;
      color: #6c757d;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
      flex-shrink: 0;
    }
    .toast-close:hover {
      background: #f8f9fa;
      color: #2c3e50;
    }
    .toast-action {
      padding: 0.25rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: inherit;
      background: rgba(0, 0, 0, 0.08);
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background 0.2s ease;
      flex-shrink: 0;
    }
    .toast-action:hover {
      background: rgba(0, 0, 0, 0.12);
    }
    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: currentColor;
      opacity: 0.3;
      animation: progress linear forwards;
      transform-origin: left;
    }
    .type-success .toast-progress { color: #28a745; }
    .type-error .toast-progress { color: #dc3545; }
    .type-warning .toast-progress { color: #ffc107; }
    .type-info .toast-progress { color: #17a2b8; }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes progress {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
  `]
})
export class ToastContainerComponent {
  position = signal<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'>('top-right');
  toasts = signal<Toast[]>([]);

  getIcon(type: Toast['type']): string {
    const icons = {
      success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    return icons[type];
  }

  remove(id: string): void {
    this.toasts.update(t => t.filter(t => t.id !== id));
  }

  executeAction(toast: Toast): void {
    toast.action?.callback();
    this.remove(toast.id);
  }

  show(toast: Omit<Toast, 'id'>): string {
    const id = crypto.randomUUID();
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 5000 };
    this.toasts.update(t => [...t, newToast]);
    
    setTimeout(() => this.remove(id), newToast.duration);
    return id;
  }

  success(title: string, message?: string, options?: Partial<Toast>): string {
    return this.show({ type: 'success', title, message, ...options });
  }

  error(title: string, message?: string, options?: Partial<Toast>): string {
    return this.show({ type: 'error', title, message, ...options });
  }

  warning(title: string, message?: string, options?: Partial<Toast>): string {
    return this.show({ type: 'warning', title, message, ...options });
  }

  info(title: string, message?: string, options?: Partial<Toast>): string {
    return this.show({ type: 'info', title, message, ...options });
  }
}

export const ToastService = new InjectionToken<ToastContainerComponent>('ToastService');