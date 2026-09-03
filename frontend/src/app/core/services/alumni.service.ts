import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AlumniProfile,
  AlumniDashboardData,
  MenteeSummary,
  AvailabilitySummary,
  RatingSummary,
  MentorshipRequestSummary,
  SessionSummary,
  AvailabilitySlot,
  SessionType
} from '../models/alumni.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AlumniService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  private _profile = signal<AlumniProfile | null>(null);
  private _dashboard = signal<AlumniDashboardData | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  profile = this._profile.asReadonly();
  dashboard = this._dashboard.asReadonly();
  isLoading = this._loading.asReadonly();
  error = this._error.asReadonly();

  getProfile(): Observable<AlumniProfile> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<AlumniProfile>(`${this.apiBase}/api/alumni/profile`).pipe(
      tap(profile => this._profile.set(profile)),
      catchError(err => { this._error.set(err.error?.message || 'Failed to load profile'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  updateProfile(payload: Partial<AlumniProfile>): Observable<AlumniProfile> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.put<AlumniProfile>(`${this.apiBase}/api/alumni/profile`, payload).pipe(
      tap(profile => this._profile.set(profile)),
      catchError(err => { this._error.set(err.error?.message || 'Failed to update profile'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  getDashboard(): Observable<AlumniDashboardData> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<AlumniDashboardData>(`${this.apiBase}/api/alumni/dashboard`).pipe(
      tap(dashboard => this._dashboard.set(dashboard)),
      catchError(err => { this._error.set(err.error?.message || 'Failed to load dashboard'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  getMentorshipRequests(params?: { status?: string; page?: number; size?: number }): Observable<PaginatedResponse<MentorshipRequestSummary>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<PaginatedResponse<MentorshipRequestSummary>>(`${this.apiBase}/api/alumni/mentorship-requests`, { params: httpParams });
  }

  getMentees(): Observable<MenteeSummary[]> {
    return this.http.get<MenteeSummary[]>(`${this.apiBase}/api/alumni/mentees`);
  }

  getUpcomingSessions(): Observable<SessionSummary[]> {
    return this.http.get<SessionSummary[]>(`${this.apiBase}/api/alumni/sessions/upcoming`);
  }

  getPastSessions(): Observable<SessionSummary[]> {
    return this.http.get<SessionSummary[]>(`${this.apiBase}/api/alumni/sessions/past`);
  }

  getAvailability(): Observable<AvailabilitySlot[]> {
    return this.http.get<AvailabilitySlot[]>(`${this.apiBase}/api/alumni/availability`);
  }

  updateAvailability(slots: AvailabilitySlot[]): Observable<AvailabilitySlot[]> {
    return this.http.put<AvailabilitySlot[]>(`${this.apiBase}/api/alumni/availability`, slots);
  }

  getSessionTypes(): Observable<SessionType[]> {
    return this.http.get<SessionType[]>(`${this.apiBase}/api/alumni/session-types`);
  }

  createSessionType(payload: Omit<SessionType, 'id'>): Observable<SessionType> {
    return this.http.post<SessionType>(`${this.apiBase}/api/alumni/session-types`, payload);
  }

  updateSessionType(id: string, payload: Partial<SessionType>): Observable<SessionType> {
    return this.http.put<SessionType>(`${this.apiBase}/api/alumni/session-types/${id}`, payload);
  }

  deleteSessionType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/api/alumni/session-types/${id}`);
  }

  getRatingSummary(): Observable<RatingSummary> {
    return this.http.get<RatingSummary>(`${this.apiBase}/api/alumni/rating-summary`);
  }
}