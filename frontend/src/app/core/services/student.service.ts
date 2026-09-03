import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  StudentProfile,
  StudentDashboardData,
  AlumniSummary,
  MentorshipSummary,
  MentorshipRequestSummary,
  SessionSummary
} from '../models/student.model';
import { PaginatedResponse, PageRequest } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  private _profile = signal<StudentProfile | null>(null);
  private _dashboard = signal<StudentDashboardData | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  profile = this._profile.asReadonly();
  dashboard = this._dashboard.asReadonly();
  isLoading = this._loading.asReadonly();
  error = this._error.asReadonly();

  getProfile(): Observable<StudentProfile> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<StudentProfile>(`${this.apiBase}/api/students/profile`).pipe(
      tap(profile => this._profile.set(profile)),
      catchError(err => { this._error.set(err.error?.message || 'Failed to load profile'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  updateProfile(payload: Partial<StudentProfile>): Observable<StudentProfile> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.put<StudentProfile>(`${this.apiBase}/api/students/profile`, payload).pipe(
      tap(profile => this._profile.set(profile)),
      catchError(err => { this._error.set(err.error?.message || 'Failed to update profile'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  getDashboard(): Observable<StudentDashboardData> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<StudentDashboardData>(`${this.apiBase}/api/students/dashboard`).pipe(
      tap(dashboard => this._dashboard.set(dashboard)),
      catchError(err => { this._error.set(err.error?.message || 'Failed to load dashboard'); return throwError(() => err); }),
      tap(() => this._loading.set(false))
    );
  }

  searchAlumni(params: {
    query?: string;
    skills?: string[];
    expertise?: string[];
    careerInterests?: string[];
    industry?: string;
    company?: string;
    availabilityStatus?: string;
    verificationStatus?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Observable<PaginatedResponse<AlumniSummary>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => httpParams = httpParams.append(key, v));
        } else {
          httpParams = httpParams.set(key, String(value));
        }
      }
    });
    return this.http.get<PaginatedResponse<AlumniSummary>>(`${this.apiBase}/api/alumni/search`, { params: httpParams });
  }

  getAlumniById(id: string): Observable<AlumniSummary> {
    return this.http.get<AlumniSummary>(`${this.apiBase}/api/alumni/${id}`);
  }

  getMentorships(): Observable<MentorshipSummary[]> {
    return this.http.get<MentorshipSummary[]>(`${this.apiBase}/api/students/mentorships`);
  }

  getMentorshipRequests(): Observable<MentorshipRequestSummary[]> {
    return this.http.get<MentorshipRequestSummary[]>(`${this.apiBase}/api/students/mentorship-requests`);
  }

  getUpcomingSessions(): Observable<SessionSummary[]> {
    return this.http.get<SessionSummary[]>(`${this.apiBase}/api/students/sessions/upcoming`);
  }

  getPastSessions(): Observable<SessionSummary[]> {
    return this.http.get<SessionSummary[]>(`${this.apiBase}/api/students/sessions/past`);
  }
}