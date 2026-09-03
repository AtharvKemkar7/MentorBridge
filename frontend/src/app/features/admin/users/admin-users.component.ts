import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUserService, AdminUser, AdminUserListResponse } from '../../../core/services/admin-user.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ab-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent, StatusBadgeComponent, PaginationComponent, RouterLink],
  template: `
    <div class="page">
      <header class="page-header">
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">View and manage platform users</p>
      </header>

      <div class="toolbar">
        <div class="search-box"><input type="text" placeholder="Search name, email..." [(ngModel)]="search" (ngModelChange)="onSearch()" class="form-input" /></div>
        <div class="filter-box"><select [(ngModel)]="roleFilter" (ngModelChange)="onSearch()" class="form-select"><option value="">All Roles</option><option value="STUDENT">Student</option><option value="ALUMNI">Alumni</option><option value="ADMIN">Admin</option></select></div>
        <div class="filter-box"><select [(ngModel)]="statusFilter" (ngModelChange)="onSearch()" class="form-select"><option value="">All Statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option></select></div>
      </div>

      @if (loading()) { <ab-loading-spinner [overlay]="true" [size]="48" /> }
      @else if (error()) { <ab-error-state [message]="error()!" (retry)="load()" /> }
      @else {
        @if (items().length) {
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Verification</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                @for (u of items(); track u.id) {
                  <tr>
                    <td>{{ u.firstName }} {{ u.lastName }}</td>
                    <td>{{ u.email }}</td>
                    <td><ab-status-badge [label]="u.role" [variant]="getRoleVariant(u.role)" /></td>
                    <td><ab-status-badge [label]="u.status" [variant]="getStatusVariant(u.status)" /></td>
                    <td>{{ u.verificationStatus ?? '-' }}</td>
                    <td>{{ formatDate(u.createdAt) }}</td>
                    <td class="actions"><a [routerLink]="['/admin/users', u.id]" class="btn btn-sm btn-primary">View</a></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ab-pagination [page]="page()" [size]="size()" [total]="total()" (pageChange)="onPageChange($event)" />
        } @else { <ab-empty-state title="No Users" message="No users match the current filters." /> }
      }
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.25rem; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .toolbar { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 250px; }
    .filter-box { min-width: 150px; }
    .form-input, .form-select { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; border-radius: 0.375rem; font-size: 0.875rem; }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e9ecef; font-size: 0.875rem; }
    .data-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
    .actions { white-space: nowrap; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.375rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; text-decoration: none; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.7rem; }
    .btn-primary { background: #2c3e50; color: #fff; }
    .btn-primary:hover { background: #1a252f; }
    @media (max-width: 768px) { .page { padding: 1rem; } .toolbar { flex-direction: column; } }
  `]
})
export class AdminUsersComponent implements OnInit {
  private svc = inject(AdminUserService);
  loading = signal(true);
  error = signal<string | null>(null);
  items = signal<AdminUser[]>([]);
  total = signal(0);
  page = signal(0);
  size = signal(10);
  search = '';
  roleFilter = '';
  statusFilter = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set(null);
    this.svc.list({ page: this.page(), size: this.size(), search: this.search || undefined, role: this.roleFilter || undefined, status: this.statusFilter || undefined }).subscribe({
      next: (res: AdminUserListResponse) => { this.items.set(res.items); this.total.set(res.total); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Failed to load'); this.loading.set(false); }
    });
  }
  onSearch(): void { this.page.set(0); this.load(); }
  onPageChange(p: number): void { this.page.set(p); this.load(); }

  getRoleVariant(r: string): 'success'|'info'|'warning'|'danger'|'default' { switch(r){ case 'ADMIN': return 'danger'; case 'ALUMNI': return 'success'; default: return 'info'; } }
  getStatusVariant(s: string): 'success'|'warning'|'danger'|'default' { switch(s){ case 'ACTIVE': return 'success'; case 'INACTIVE': return 'warning'; case 'SUSPENDED': return 'danger'; default: return 'default'; } }
  formatDate(s: string): string { return new Date(s).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' }); }
}