import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ab-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to your AlumniBridge account</p>
        </div>

        @if (auth.error()) {
          <div class="alert alert-error" role="alert">{{ auth.error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@university.edu"
              autocomplete="email"
              [class.invalid]="email.invalid && (email.dirty || email.touched)"
            />
            @if (email.invalid && (email.dirty || email.touched)) {
              <small class="error-text">Valid email is required</small>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
              [class.invalid]="password.invalid && (password.dirty || password.touched)"
            />
            @if (password.invalid && (password.dirty || password.touched)) {
              <small class="error-text">Password is required</small>
            }
          </div>

          <button type="submit" class="btn-primary btn-block" [disabled]="form.invalid || auth.isLoading()">
            @if (auth.isLoading()) { <span class="loading-spinner"></span> }
            Sign In
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Register</a></p>
          <p><a routerLink="/forgot-password">Forgot password?</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 200px); display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; }
    .auth-card { width: 100%; max-width: 420px; }
    .auth-header { text-align: center; margin-bottom: 1.5rem; }
    .auth-title { margin: 0 0 0.5rem; font-size: 1.5rem; font-weight: 700; color: #2c3e50; }
    .auth-subtitle { margin: 0; color: #6c757d; }
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    .btn-block { width: 100%; padding: 0.75rem; font-size: 1rem; }
    .auth-footer { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: #6c757d; }
    .auth-footer a { font-weight: 500; }
    .error-text { color: #c0392b; font-size: 0.75rem; margin-top: 0.25rem; display: block; }
    .invalid { border-color: #c0392b !important; }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  onSubmit(): void {
    if (this.form.valid) {
      this.auth.login(this.form.getRawValue()).subscribe({
        next: () => this.redirectByRole()
      });
    }
  }

  private redirectByRole(): void {
    const role = this.auth.userRole();
    if (role === 'STUDENT') this.router.navigate(['/student/dashboard']);
    else if (role === 'ALUMNI') this.router.navigate(['/alumni/dashboard']);
    else if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/']);
  }
}