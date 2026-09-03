import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MentorshipRequest,
  Mentorship,
  CreateMentorshipRequestDto,
  RespondToMentorshipRequestDto,
  UpdateMentorshipDto,
  MentorshipCategory,
  MENTORSHIP_CATEGORIES
} from '../models/mentorship.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class MentorshipService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  readonly categories = MENTORSHIP_CATEGORIES;

  createRequest(payload: CreateMentorshipRequestDto): Observable<MentorshipRequest> {
    return this.http.post<MentorshipRequest>(`${this.apiBase}/api/mentorship/requests`, payload);
  }

  getStudentRequests(): Observable<MentorshipRequest[]> {
    return this.http.get<MentorshipRequest[]>(`${this.apiBase}/api/mentorship/requests/student`);
  }

  getAlumniRequests(params?: { status?: string; page?: number; size?: number }): Observable<PaginatedResponse<MentorshipRequest>> {
    return this.http.get<PaginatedResponse<MentorshipRequest>>(`${this.apiBase}/api/mentorship/requests/alumni`, { params: params as any });
  }

  getRequestById(id: string): Observable<MentorshipRequest> {
    return this.http.get<MentorshipRequest>(`${this.apiBase}/api/mentorship/requests/${id}`);
  }

  respondToRequest(payload: RespondToMentorshipRequestDto): Observable<MentorshipRequest> {
    return this.http.post<MentorshipRequest>(`${this.apiBase}/api/mentorship/requests/respond`, payload);
  }

  cancelRequest(requestId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/api/mentorship/requests/${requestId}`);
  }

  getStudentMentorships(): Observable<Mentorship[]> {
    return this.http.get<Mentorship[]>(`${this.apiBase}/api/mentorship/student`);
  }

  getAlumniMentorships(): Observable<Mentorship[]> {
    return this.http.get<Mentorship[]>(`${this.apiBase}/api/mentorship/alumni`);
  }

  getMentorshipById(id: string): Observable<Mentorship> {
    return this.http.get<Mentorship>(`${this.apiBase}/api/mentorship/${id}`);
  }

  updateMentorship(payload: UpdateMentorshipDto): Observable<Mentorship> {
    return this.http.put<Mentorship>(`${this.apiBase}/api/mentorship`, payload);
  }

  getCategories(): MentorshipCategory[] {
    return MENTORSHIP_CATEGORIES.map(c => c.value);
  }
}