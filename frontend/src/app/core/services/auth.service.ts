import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiBase = environment.apiBaseUrl;

  private _user = signal<User | null>(null);
  private _accessToken = signal<string | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  user = this._user.asReadonly();
  accessToken = this._accessToken.asReadonly();
  isAuthenticated = computed(() => !!this._accessToken());
  isLoading = this._loading.asReadonly();
  error = this._error.asReadonly();
  userRole = computed(() => this._user()?.role ?? null);

  constructor() { this.initSession(); }

  private initSession(): void {
    const token = localStorage.getItem('access_token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      this._accessToken.set(token);
      this._user.set(JSON.parse(userJson));
    }
  }

  private setSession(auth: AuthResponse): void {
    this._accessToken.set(auth.accessToken);
    this._user.set(auth.user);
    localStorage.setItem('access_token', auth.accessToken);
    localStorage.setItem('user', JSON.stringify(auth.user));
  }

  private clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<AuthResponse>(`${this.apiBase}/api/auth/login`, payload).pipe(
      tap(res => this.setSession(res)),
      catchError(err => { this._error.set(err.error?.detail || 'Login failed'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    this._loading.set(true);
    this._error.set(null);
    const { confirmPassword, ...body } = payload;
    return this.http.post<AuthResponse>(`${this.apiBase}/api/auth/register`, body).pipe(
      tap(res => this.setSession(res)),
      catchError(err => { this._error.set(err.error?.detail || 'Registration failed'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  logout(): void {
    this.http.post(`${this.apiBase}/api/auth/logout`, {}).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout()
    });
  }

  private finishLogout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<void> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<void>(`${this.apiBase}/api/auth/forgot-password`, payload).pipe(
      catchError(err => { this._error.set(err.error?.detail || 'Request failed'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  resetPassword(payload: ResetPasswordRequest): Observable<void> {
    this._loading.set(true);
    this._error.set(null);
    const { confirmPassword, ...body } = payload;
    return this.http.post<void>(`${this.apiBase}/api/auth/reset-password`, body).pipe(
      catchError(err => { this._error.set(err.error?.detail || 'Reset failed'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  getCurrentUserId(): string | null {
    return this._user()?.id ?? null;
  }
}