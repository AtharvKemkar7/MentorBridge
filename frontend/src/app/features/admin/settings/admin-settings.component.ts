import { Component, inject, OnInit, signal, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, Observable } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

interface SettingItem { key: string; value: string; description?: string; type: 'string' | 'number' | 'boolean' | 'json'; }

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  private base = `${environment.apiBaseUrl}/admin/settings`;
  constructor(private http: HttpClient) {}
  list(): Observable<SettingItem[]> { return this.http.get<SettingItem[]>(this.base); }
  update(payload: Record<string, any>): Observable<SettingItem[]> { return this.http.put<SettingItem[]>(this.base, payload); }
}

@Component({
  selector: 'ab-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorStateComponent, ToastComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1 class="page-title">Institute Settings</h1>
        <p class="page-subtitle">Configure platform settings</p>
      </header>

      @if (loading()) { <ab-loading-spinner [overlay]="true" [size]="48" /> }
      @else if (error()) { <ab-error-state [message]="error()!" (retry)="load()" /> }
      @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="settings-form">
          <div class="form-section" *ngFor="let s of settings()">
            <h3>{{ s.key }}</h3>
            <p class="text-muted" *ngIf="s.description">{{ s.description }}</p>
            <div class="form-group">
              @if (s.type === 'boolean') {
                <label class="checkbox"><input type="checkbox" [formControlName]="s.key" /> Enabled</label>
              } @else if (s.type === 'json') {
                <textarea [formControlName]="s.key" class="form-textarea" rows="4"></textarea>
              } @else {
                <input [type]="s.type === 'number' ? 'number' : 'text'" [formControlName]="s.key" class="form-input" />
              }
              @if (form.get(s.key)?.invalid && form.get(s.key)?.touched) { <div class="text-danger">Invalid value</div> }
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">Save Changes</button>
            <button type="button" class="btn btn-secondary" (click)="reset()">Reset</button>
          </div>
        </form>
      }
      <ab-toast />
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { margin: 0 0 0.25rem; font-size: 1.75rem; font-weight: 700; color: #2c3e50; }
    .page-subtitle { margin: 0; font-size: 1rem; color: #6c757d; }
    .settings-form { max-width: 800px; }
    .form-section { background: #fff; border: 1px solid #e9ecef; border-radius: 0.5rem; padding: 1.25rem; margin-bottom: 1.5rem; }
    .form-section h3 { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 600; color: #2c3e50; }
    .text-muted { margin: 0 0 0.75rem; font-size: 0.8125rem; color: #6c757d; }
    .form-group { margin-bottom: 0; }
    .form-input, .form-textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ced4da; border-radius: 0.375rem; font-size: 0.875rem; }
    .checkbox { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; color: #495057; cursor: pointer; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; border: none; cursor: pointer; }
    .btn-primary { background: #2c3e50; color: #fff; } .btn-primary:hover:not(:disabled) { background: #1a252f; }
    .btn-secondary { background: #fff; color: #495057; border: 1px solid #dee2e6; } .btn-secondary:hover { background: #f8f9fa; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .text-danger { color: #dc3545; font-size: 0.75rem; margin-top: 0.25rem; }
    @media (max-width: 768px) { .page { padding: 1rem; } }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private svc = inject(AdminSettingsService);

  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  settings = signal<SettingItem[]>([]);
  form = this.fb.group({});

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set(null);
    this.svc.list().subscribe({
      next: (list) => { this.settings.set(list); const controls: any = {}; list.forEach(s => { const val = s.type === 'boolean' ? s.value === 'true' : s.value; controls[s.key] = [val, s.type === 'number' ? Validators.pattern('^-?\\d+(\\.\\d+)?$') : []]; }); this.form = this.fb.group(controls); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Failed to load settings'); this.loading.set(false); }
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.svc.update(this.form.value).subscribe({ next: () => { this.saving.set(false); console.log('Saved'); }, error: (err) => { this.saving.set(false); alert(err?.message || 'Save failed'); } });
  }

  reset(): void { this.load(); }
}