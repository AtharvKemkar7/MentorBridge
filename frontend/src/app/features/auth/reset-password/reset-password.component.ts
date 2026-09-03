import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ab-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <h1 class="auth-title">Reset Password</h1>
          <p class="auth-subtitle">Enter your new password</p>
        </div>

        @if (auth.error()) {
          <div class="alert alert-error" role="alert">{{ auth.error() }}</div>
        }
        @if (success()) {
          <div class="alert alert-success" role="alert">Password reset successful. <a routerLink="/login">Sign In</a></div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!success()">
          <div class="form-group">
            <label for="password">New Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Min 8 characters" autocomplete="new-password" [class.invalid]="pwd.invalid && (pwd.dirty || pwd.touched)" />
            @if (pwd.invalid && (pwd.dirty || pwd.touched)) { <small class="error-text">Min 8 chars, 1 uppercase, 1 number</small> }
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="Confirm password" autocomplete="new-password" [class.invalid]="cpwd.invalid && (cpwd.dirty || cpwd.touched)" />
            @if (cpwd.invalid && (cpwd.dirty || cpwd.touched)) { <small class="error-text">Passwords must match</small> }
          </div>
          <button type="submit" class="btn-primary btn-block" [disabled]="form.invalid || auth.isLoading()">
            @if (auth.isLoading()) { <span class="loading-spinner"></span> }
            Reset Password
          </button>
        </form>

        <div class="auth-footer">
          <p><a routerLink="/login">Back to Sign In</a></p>
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
export class ResetPasswordComponent implements OnInit {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  success = signal(false);
  private token = '';

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  get pwd() { return this.form.controls.password; }
  get cpwd() { return this.form.controls.confirmPassword; }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      // Token validation will be handled by backend
    }
  }

  private passwordMatchValidator(control: any) {
    const pwd = control.get('password');
    const cpwd = control.get('confirmPassword');
    if (pwd && cpwd && pwd.value !== cpwd.value) {
      cpwd.setErrors({ mismatch: true });
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.valid && this.token) {
      const { confirmPassword, ...payload } = this.form.getRawValue();
      this.auth.resetPassword({ ...payload, token: this.token, confirmPassword: '' }).subscribe({
        next: () => this.success.set(true)
      });
    }
  }
}