import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminUserService, AdminUser } from '../../../core/services/admin-user.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ab-admin-user-detail',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorStateComponent, StatusBadgeComponent, RouterLink],
  template: `
    <div class="page">
      <header class="page-header">
        <a routerLink="/admin/users" class="btn btn-secondary btn-sm back-link">← Back</a>
        <h1 class="page-title">User Details</h1>
      </header>

      @if (loading()) { <ab-loading-spinner [overlay]="true" [size]="48" /> }
      @else if (error()) { <ab-error-state [message]="error()!" (retry)="load()" /> }
      @else if (user()) {
        <div class="detail-grid">
          <section class="card">
            <header class="section-header"><h2 class="section-title">Profile</h2></header>
            <div class="section-content">
              <dl class="detail-list">
                <dt>Full Name</dt><dd>{{ user()!.firstName }} {{ user()!.lastName }}</dd>
                <dt>Email</dt><dd>{{ user()!.email }}</dd>
                <dt>Role</dt><dd><ab-status-badge [label]="user()!.role" [variant]="getRoleVariant(user()!.role)" /></dd>
                <dt>Status</dt><dd><ab-status-badge [label]="user()!.status" [variant]="getStatusVariant(user()!.status)" /></dd>
                <dt>Verification</dt><dd>{{ user()!.verificationStatus ?? 'N/A' }}</dd>
                <dt>Created</dt><dd>{{ formatDate(user()!.createdAt) }}</dd>
                <dt>Updated</dt><dd>{{ formatDate(user()!.updatedAt) }}</dd>
              </dl>
            </div>
          </section>

          <section class="card">
            <header class="section-header"><h2 class="section-title">Actions</h2></header>
            <div class="section-content actions">
              <div class="action-row">
                <label>Account Status</label>
                <select [value]="user()!.status" (change)="updateStatus($event)" class="form-select">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      } @else { <ab-empty-state title="User Not Found" message="The requested user does not exist." /> }
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    .page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .back-link { align-self: flex-start; }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
    .card { background: #fff; border: 1px solid #e9ecef; border-radius: 0.75rem; overflow: hidden; }
    .section-header { padding: 1rem 1.25rem; border-bottom: 1px solid #e9ecef; }
    .section-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #2c3e50; }
    .section-content { padding: 1rem 1.25rem; }
    .detail-list { display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1.5rem; }
    .detail-list dt { font-weight: 500; color: #6c757d; }
    .detail-list dd { margin: 0; color: #2c3e50; }
    .actions { display: flex; flex-direction: column; gap: 1rem; }
    .action-row { display: flex; align-items: center; gap: 1rem; }
    .action-row label { min-width: 150px; font-weight: 500; color: #495057; }
    .form-select { padding: 0.5rem 0.75rem; border: 1px solid #ced4da; border-radius: 0.375rem; font-size: 0.875rem; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.375rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; text-decoration: none; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.7rem; }
    .btn-secondary { background: #fff; color: #495057; border: 1px solid #dee2e6; }
    .btn-secondary:hover { background: #f8f9fa; border-color: #ced4da; }
    @media (max-width: 768px) { .page { padding: 1rem; } .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminUserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(AdminUserService);

  loading = signal(true);
  error = signal<string | null>(null);
  user = signal<AdminUser | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string): void {
    this.loading.set(true); this.error.set(null);
    this.svc.get(id).subscribe({
      next: (u) => { this.user.set(u); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Failed to load user'); this.loading.set(false); }
    });
  }

  updateStatus(ev: Event): void {
    const val = (ev.target as HTMLSelectElement).value as AdminUser['status'];
    const u = this.user(); if (!u) return;
    this.svc.updateStatus(u.id, { status: val }).subscribe({
      next: (updated) => { this.user.set(updated); },
      error: (err) => { alert(err?.message || 'Failed to update status'); this.load(u.id); }
    });
  }

  getRoleVariant(r: string): 'success'|'info'|'warning'|'danger'|'default' { switch(r){ case 'ADMIN': return 'danger'; case 'ALUMNI': return 'success'; default: return 'info'; } }
  getStatusVariant(s: string): 'success'|'warning'|'danger'|'default' { switch(s){ case 'ACTIVE': return 'success'; case 'INACTIVE': return 'warning'; case 'SUSPENDED': return 'danger'; default: return 'default'; } }
  formatDate(s: string): string { return new Date(s).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' }); }
}