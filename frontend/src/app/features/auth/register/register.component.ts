import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'ab-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join the AlumniBridge community</p>
        </div>

        @if (auth.error()) {
          <div class="alert alert-error" role="alert">{{ auth.error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input id="firstName" type="text" formControlName="firstName" placeholder="John" autocomplete="given-name" [class.invalid]="fn.invalid && (fn.dirty || fn.touched)" />
              @if (fn.invalid && (fn.dirty || fn.touched)) { <small class="error-text">Required</small> }
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input id="lastName" type="text" formControlName="lastName" placeholder="Doe" autocomplete="family-name" [class.invalid]="ln.invalid && (ln.dirty || ln.touched)" />
              @if (ln.invalid && (ln.dirty || ln.touched)) { <small class="error-text">Required</small> }
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="you@university.edu" autocomplete="email" [class.invalid]="email.invalid && (email.dirty || email.touched)" />
            @if (email.invalid && (email.dirty || email.touched)) { <small class="error-text">Valid email required</small> }
          </div>

          <div class="form-group">
            <label for="role">Register as</label>
            <select id="role" formControlName="role">
              <option value="STUDENT">Student</option>
              <option value="ALUMNI">Alumni</option>
            </select>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Min 8 characters" autocomplete="new-password" [class.invalid]="pwd.invalid && (pwd.dirty || pwd.touched)" />
            @if (pwd.invalid && (pwd.dirty || pwd.touched)) {
              <small class="error-text">Min 8 chars, 1 uppercase, 1 number</small>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="Confirm password" autocomplete="new-password" [class.invalid]="cpwd.invalid && (cpwd.dirty || cpwd.touched)" />
            @if (cpwd.invalid && (cpwd.dirty || cpwd.touched)) { <small class="error-text">Passwords must match</small> }
          </div>

          <button type="submit" class="btn-primary btn-block" [disabled]="form.invalid || auth.isLoading()">
            @if (auth.isLoading()) { <span class="loading-spinner"></span> }
            Create Account
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign In</a></p>
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
    .form-row { display: flex; gap: 1rem; }
    .form-row .form-group { flex: 1; }
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    .btn-block { width: 100%; padding: 0.75rem; font-size: 1rem; }
    .auth-footer { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: #6c757d; }
    .auth-footer a { font-weight: 500; }
    .error-text { color: #c0392b; font-size: 0.75rem; margin-top: 0.25rem; display: block; }
    .invalid { border-color: #c0392b !important; }
    select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; padding-right: 2.5rem; }
  `]
})
export class RegisterComponent {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['STUDENT' as const, Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  get fn() { return this.form.controls.firstName; }
  get ln() { return this.form.controls.lastName; }
  get email() { return this.form.controls.email; }
  get pwd() { return this.form.controls.password; }
  get cpwd() { return this.form.controls.confirmPassword; }

  private passwordMatchValidator(control: any) {
    const pwd = control.get('password');
    const cpwd = control.get('confirmPassword');
    if (pwd && cpwd && pwd.value !== cpwd.value) {
      cpwd.setErrors({ mismatch: true });
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const { confirmPassword, ...payload } = this.form.getRawValue();
      this.auth.register({ ...payload, confirmPassword: '' }).subscribe({
        next: () => this.redirectByRole()
      });
    }
  }

  private redirectByRole(): void {
    const role = this.auth.userRole();
    if (role === 'STUDENT') this.router.navigate(['/student/dashboard']);
    else if (role === 'ALUMNI') this.router.navigate(['/alumni/dashboard']);
    else this.router.navigate(['/']);
  }
}