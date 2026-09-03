import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';

@Component({
  selector: 'ab-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="'variant-' + variant()" [class.dot]="dot()">
      @if (dot()) {
        <span class="status-dot"></span>
      }
      {{ label() }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      text-transform: uppercase;
      border-radius: 9999px;
      white-space: nowrap;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .variant-default { background: #e9ecef; color: #495057; }
    .variant-primary { background: #d6eaff; color: #1a73e8; }
    .variant-secondary { background: #e9ecef; color: #495057; }
    .variant-success { background: #d4edda; color: #155724; }
    .variant-warning { background: #fff3cd; color: #856404; }
    .variant-danger { background: #f8d7da; color: #721c24; }
    .variant-info { background: #d1ecf1; color: #0c5460; }
    .variant-PENDING { background: #fff3cd; color: #856404; }
    .variant-ACCEPTED { background: #d4edda; color: #155724; }
    .variant-REJECTED { background: #f8d7da; color: #721c24; }
    .variant-CANCELLED { background: #e9ecef; color: #495057; }
    .variant-ACTIVE { background: #d4edda; color: #155724; }
    .variant-PAUSED { background: #fff3cd; color: #856404; }
    .variant-ENDED { background: #e9ecef; color: #495057; }
    .variant-SCHEDULED { background: #d6eaff; color: #1a73e8; }
    .variant-COMPLETED { background: #d4edda; color: #155724; }
    .variant-CONFIRMED { background: #d4edda; color: #155724; }
    .variant-RESCHEDULED { background: #fff3cd; color: #856404; }
    .variant-NO_SHOW { background: #f8d7da; color: #721c24; }
    .variant-IN_PROGRESS { background: #d6eaff; color: #1a73e8; }
    .variant-PUBLISHED { background: #d4edda; color: #155724; }
    .variant-PENDING_MODERATION { background: #fff3cd; color: #856404; }
    .variant-HIDDEN { background: #e9ecef; color: #495057; }
    .variant-VERIFIED { background: #d4edda; color: #155724; }
    .variant-AVAILABLE { background: #d4edda; color: #155724; }
    .variant-BUSY { background: #fff3cd; color: #856404; }
    .variant-UNAVAILABLE { background: #e9ecef; color: #495057; }
  `]
})
export class StatusBadgeComponent {
  label = input.required<string>();
  variant = input<StatusVariant>('default');
  dot = input(false);
}