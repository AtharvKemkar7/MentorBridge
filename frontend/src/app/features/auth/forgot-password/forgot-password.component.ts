import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ab-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <h1 class="auth-title">Forgot Password</h1>
          <p class="auth-subtitle">Enter your email to receive reset instructions</p>
        </div>

        @if (auth.error()) {
          <div class="alert alert-error" role="alert">{{ auth.error() }}</div>
        }
        @if (submitted()) {
          <div class="alert alert-success" role="alert">If the email exists, reset instructions have been sent.</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!submitted()">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="you@university.edu" autocomplete="email" [class.invalid]="email.invalid && (email.dirty || email.touched)" />
            @if (email.invalid && (email.dirty || email.touched)) { <small class="error-text">Valid email required</small> }
          </div>
          <button type="submit" class="btn-primary btn-block" [disabled]="form.invalid || auth.isLoading()">
            @if (auth.isLoading()) { <span class="loading-spinner"></span> }
            Send Reset Link
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
export class ForgotPasswordComponent {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  submitted = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get email() { return this.form.controls.email; }

  onSubmit(): void {
    if (this.form.valid) {
      this.auth.forgotPassword(this.form.getRawValue()).subscribe({
        next: () => this.submitted.set(true)
      });
    }
  }
}