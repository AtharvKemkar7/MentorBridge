import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Session,
  SessionFilters,
  SessionPageResponse,
  CompleteSessionDto,
  SessionFeedbackDto
} from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  getStudentSessions(filters?: SessionFilters): Observable<SessionPageResponse> {
    return this.http.get<SessionPageResponse>(`${this.apiBase}/api/sessions/student`, { params: filters as any });
  }

  getAlumniSessions(filters?: SessionFilters): Observable<SessionPageResponse> {
    return this.http.get<SessionPageResponse>(`${this.apiBase}/api/sessions/alumni`, { params: filters as any });
  }

  getSessionById(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiBase}/api/sessions/${id}`);
  }

  completeSession(payload: CompleteSessionDto): Observable<Session> {
    return this.http.post<Session>(`${this.apiBase}/api/sessions/${payload.sessionId}/complete`, payload);
  }

  submitFeedback(payload: SessionFeedbackDto): Observable<Session> {
    return this.http.post<Session>(`${this.apiBase}/api/sessions/${payload.sessionId}/feedback`, payload);
  }

  getUpcomingSessions(role: 'student' | 'alumni'): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiBase}/api/sessions/${role}/upcoming`);
  }

  getPastSessions(role: 'student' | 'alumni'): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiBase}/api/sessions/${role}/past`);
  }
}