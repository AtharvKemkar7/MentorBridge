import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Review,
  CreateReviewDto,
  UpdateReviewDto,
  ReviewFilters,
  ReviewPageResponse,
  ReviewEligibility,
  RatingSummary
} from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  createReview(payload: CreateReviewDto): Observable<Review> {
    return this.http.post<Review>(`${this.apiBase}/api/reviews`, payload);
  }

  getStudentReviews(filters?: ReviewFilters): Observable<ReviewPageResponse> {
    return this.http.get<ReviewPageResponse>(`${this.apiBase}/api/reviews/student`, { params: filters as any });
  }

  getAlumniReviews(filters?: ReviewFilters): Observable<ReviewPageResponse> {
    return this.http.get<ReviewPageResponse>(`${this.apiBase}/api/reviews/alumni`, { params: filters as any });
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiBase}/api/reviews/${id}`);
  }

  updateReview(id: string, payload: UpdateReviewDto): Observable<Review> {
    return this.http.put<Review>(`${this.apiBase}/api/reviews/${id}`, payload);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/api/reviews/${id}`);
  }

  checkEligibility(sessionId: string): Observable<ReviewEligibility> {
    return this.http.get<ReviewEligibility>(`${this.apiBase}/api/reviews/eligibility/${sessionId}`);
  }

  getRatingSummary(mentorId: string): Observable<RatingSummary> {
    return this.http.get<RatingSummary>(`${this.apiBase}/api/reviews/rating-summary/${mentorId}`);
  }
}