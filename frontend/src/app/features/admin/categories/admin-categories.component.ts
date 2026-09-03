import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService, Category, CategoryListResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../../../core/services/category.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'ab-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent, ConfirmDialogComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1 class="page-title">Mentorship Categories</h1>
        <p class="page-subtitle">Manage mentorship categories</p>
        <button class="btn btn-primary" (click)="openCreate()">+ Add Category</button>
      </header>

      <div class="toolbar">
        <div class="search-box"><input type="text" placeholder="Search name..." [(ngModel)]="search" (ngModelChange)="onSearch()" class="form-input" /></div>
      </div>

      @if (loading()) { <ab-loading-spinner [overlay]="true" [size]="48" /> }
      @else if (error()) { <ab-error-state [message]="error()!" (retry)="load()" /> }
      @else {
        @if (items().length) {
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr><th>Name</th><th>Description</th><th>Active</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                @for (c of items(); track c.id) {
                  <tr>
                    <td>{{ c.name }}</td>
                    <td>{{ c.description ?? '-' }}</td>
                    <td><ab-status-badge [label]="c.active ? 'Active' : 'Inactive'" [variant]="c.active ? 'success' : 'warning'" [dot]="true" /></td>
                    <td>{{ formatDate(c.createdAt) }}</td>
                    <td class="actions">
                      <button class="btn btn-sm btn-secondary" (click)="openEdit(c)">Edit</button>
                      <button class="btn btn-sm btn-danger" (click)="openDelete(c)">Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ab-pagination [page]="page()" [size]="size()" [total]="total()" (pageChange)="onPageChange($event)" />
        } @else { <ab-empty-state title="No Categories" message="No categories found." /> }
      }

      <!-- Create/Edit Modal -->
      <ab-confirm-dialog *ngIf="editing()" title="{{ editing()?.id ? 'Edit Category' : 'Create Category' }}" confirmLabel="Save" cancelLabel="Cancel" (confirm)="saveCategory()" (cancel)="closeForm()">
        <form [formGroup]="form" class="form">
          <div class="form-group"><label>Name *</label><input type="text" formControlName="name" class="form-input" /></div>
          <div class="form-group"><label>Description</label><textarea formControlName="description" class="form-textarea" rows="2"></textarea></div>
          <div class="form-group"><label>Active</label><input type="checkbox" formControlName="active" /></div>
          @if (form.get('name')?.invalid && form.get('name')?.touched) { <div class="text-danger">Name is required</div> }
        </form>
      </ab-confirm-dialog>

      <!-- Delete Confirm -->
      <ab-confirm-dialog *ngIf="deleting()" title="Delete Category" message="Are you sure you want to delete this category? This action cannot be undone." confirmLabel="Delete" cancelLabel="Cancel" confirmClass="btn-danger" (confirm)="confirmDelete()" (cancel)="closeDelete()" />
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 250px; }
    .form-input, .form-textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; border-radius: 0.375rem; font-size: 0.875rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; color: #495057; }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e9ecef; font-size: 0.875rem; }
    .data-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
    .actions { display: flex; gap: 0.5rem; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.375rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.7rem; }
    .btn-primary { background: #2c3e50; color: #fff; }
    .btn-primary:hover { background: #1a252f; }
    .btn-secondary { background: #fff; color: #495057; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    .btn-danger { background: #dc3545; color: #fff; }
    .btn-danger:hover { background: #c82333; }
    .text-danger { color: #dc3545; font-size: 0.75rem; margin-top: 0.25rem; }
    @media (max-width: 768px) { .page { padding: 1rem; } .page-header { flex-direction: column; align-items: flex-start; } }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private svc = inject(CategoryService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  error = signal<string | null>(null);
  items = signal<Category[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(10);
  search = '';

  editing = signal<Category | null>(null);
  deleting = signal<Category | null>(null);
  form = this.fb.group({ name: ['', Validators.required], description: [''], active: [true] });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set(null);
    this.svc.list({ page: this.page(), size: this.size(), search: this.search || undefined }).subscribe({
      next: (res: CategoryListResponse) => { this.items.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Failed to load'); this.loading.set(false); }
    });
  }
  onSearch(): void { this.page.set(0); this.load(); }
  onPageChange(p: number): void { this.page.set(p); this.load(); }

  openCreate(): void { this.form.reset({ name: '', description: '', active: true }); this.editing.set({} as Category); }
  openEdit(c: Category): void { this.form.patchValue({ name: c.name, description: c.description ?? '', active: c.active }); this.editing.set(c); }
  closeForm(): void { this.editing.set(null); }

  saveCategory(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload = this.form.value as CreateCategoryRequest;
    const isEdit = !!this.editing()?.id;
    const obs = isEdit ? this.svc.update(this.editing()!.id, payload) : this.svc.create(payload);
    obs.subscribe({ next: () => { this.closeForm(); this.load(); }, error: (err) => alert(err?.message || 'Save failed') });
  }

  openDelete(c: Category): void { this.deleting.set(c); }
  closeDelete(): void { this.deleting.set(null); }
  confirmDelete(): void {
    const c = this.deleting(); if (!c) return;
    this.svc.delete(c.id).subscribe({ next: () => { this.closeDelete(); this.load(); }, error: (err) => alert(err?.message || 'Delete failed') });
  }

  formatDate(s: string): string { return new Date(s).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' }); }
}