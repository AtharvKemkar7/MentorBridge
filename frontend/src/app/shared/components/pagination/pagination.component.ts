import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ab-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination" aria-label="Pagination">
        <ul class="pagination-list">
          <li class="pagination-item">
            <button 
              type="button" 
              class="pagination-link" 
              [disabled]="currentPage() === 1" 
              (click)="goToPage(currentPage() - 1)"
              aria-label="Previous page">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          </li>
          @for (page of visiblePages(); track page) {
            @if (page === '...') {
              <li class="pagination-item">
                <span class="pagination-ellipsis">...</span>
              </li>
            } @else {
              <li class="pagination-item">
                <button 
                  type="button" 
                  class="pagination-link" 
                  [class.active]="page === currentPage()" 
                  (click)="goToPage(page)"
                  [attr.aria-current]="page === currentPage() ? 'page' : null"
                  [attr.aria-label]="'Page ' + page">
                  {{ page }}
                </button>
              </li>
            }
          }
          <li class="pagination-item">
            <button 
              type="button" 
              class="pagination-link" 
              [disabled]="currentPage() === totalPages()" 
              (click)="goToPage(currentPage() + 1)"
              aria-label="Next page">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </li>
        </ul>
        <div class="pagination-info">
          Page {{ currentPage() }} of {{ totalPages() }} ({{ totalElements() }} items)
        </div>
      </nav>
    }
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .pagination-list {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .pagination-link {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      padding: 0 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #2c3e50;
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pagination-link:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #ced4da;
    }
    .pagination-link.active {
      color: #fff;
      background: #2c3e50;
      border-color: #2c3e50;
    }
    .pagination-link:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .pagination-ellipsis {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      color: #6c757d;
    }
    .pagination-info {
      font-size: 0.8125rem;
      color: #6c757d;
      white-space: nowrap;
    }
  `]
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  totalElements = input.required<number>();
  maxVisiblePages = input(5);

  pageChange = output<number>();

  visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const maxVisible = this.maxVisiblePages();
    
    if (total <= maxVisible + 2) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];
    let start = Math.max(2, current - Math.floor(maxVisible / 2));
    let end = Math.min(total - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(2, end - maxVisible + 1);
    }

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) {
      pages.push('...');
    }

    pages.push(total);
    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}