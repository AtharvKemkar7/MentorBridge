import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VerificationItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  graduationYear?: number;
  major?: string;
  institution?: string;
  documentUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface VerificationListResponse {
  items: VerificationItem[];
  total: number;
  page: number;
  size: number;
}

export interface ApproveVerificationRequest {
  // maybe empty
}

export interface RejectVerificationRequest {
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class VerificationService {
  private base = `${environment.apiBaseUrl}/admin/verifications`;

  constructor(private http: HttpClient) {}

  list(params?: { page?: number; size?: number; search?: string; status?: string }): Observable<VerificationListResponse> {
    let hp = new HttpParams();
    if (params?.page) hp = hp.set('page', params.page);
    if (params?.size) hp = hp.set('size', params.size);
    if (params?.search) hp = hp.set('search', params.search);
    if (params?.status) hp = hp.set('status', params.status);
    return this.http.get<VerificationListResponse>(this.base, { params: hp });
  }

  get(id: string): Observable<VerificationItem> {
    return this.http.get<VerificationItem>(`${this.base}/${id}`);
  }

  approve(id: string): Observable<VerificationItem> {
    return this.http.post<VerificationItem>(`${this.base}/${id}/approve`, {});
  }

  reject(id: string, reason: string): Observable<VerificationItem> {
    return this.http.post<VerificationItem>(`${this.base}/${id}/reject`, { reason });
  }
}