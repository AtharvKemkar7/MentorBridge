import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ab-rating-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rating-display" [class.interactive]="interactive()" [class.readonly]="!interactive()">
      @for (star of stars(); track $index) {
        <button 
          type="button" 
          class="rating-star" 
          [class.filled]="star === 'full'"
          [class.half]="star === 'half'"
          [class.empty]="star === 'empty'"
          [disabled]="!interactive()"
          (click)="interactive() && rate.emit($index + 1)"
          (keydown.enter)="interactive() && rate.emit($index + 1)"
          (keydown.space)="interactive() && rate.emit($index + 1)"
          [attr.aria-label]="'Rate ' + ($index + 1) + ' out of 5'"
          [attr.aria-pressed]="star !== 'empty'">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          @if (star === 'half') {
            <svg class="half-star-overlay" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" clip-path="polygon(0 0, 50% 0, 50% 100%, 0 100%)"/>
            </svg>
          }
        </button>
      }
      @if (showValue()) {
        <span class="rating-value" [attr.aria-label]="'Average rating ' + value() + ' out of 5'">{{ value().toFixed(1) }}</span>
      }
      @if (showCount() && count() !== null && count() !== undefined) {
        <span class="rating-count" [attr.aria-label]="'Based on ' + count() + ' reviews'">({{ count() }})</span>
      }
    </div>
  `,
  styles: [`
    .rating-display {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }
    .rating-star {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: none;
      background: transparent;
      color: #dee2e6;
      cursor: pointer;
      transition: color 0.2s ease, transform 0.1s ease;
      position: relative;
    }
    .rating-star:hover:not(:disabled) {
      transform: scale(1.1);
    }
    .rating-star:focus-visible {
      outline: 2px solid #2c3e50;
      outline-offset: 2px;
      border-radius: 2px;
    }
    .rating-star.filled {
      color: #ffc107;
    }
    .rating-star.half {
      color: #dee2e6;
    }
    .half-star-overlay {
      position: absolute;
      color: #ffc107;
    }
    .rating-value {
      font-size: 1rem;
      font-weight: 600;
      color: #2c3e50;
      min-width: 2.5ch;
    }
    .rating-count {
      font-size: 0.8125rem;
      color: #6c757d;
    }
    .rating-display.readonly .rating-star {
      cursor: default;
    }
  `]
})
export class RatingDisplayComponent {
  value = input.required<number>();
  max = input(5);
  count = input<number | null>(null);
  showValue = input(true);
  showCount = input(true);
  interactive = input(false);
  size = input<'sm' | 'md' | 'lg'>('md');

  rate = output<number>();

  stars = computed(() => {
    const val = Math.max(0, Math.min(this.value(), this.max()));
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= this.max(); i++) {
      if (i <= Math.floor(val)) {
        stars.push('full');
      } else if (i === Math.ceil(val) && val % 1 >= 0.5) {
        stars.push('half');
      } else if (i === Math.ceil(val) && val % 1 > 0) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  });
}