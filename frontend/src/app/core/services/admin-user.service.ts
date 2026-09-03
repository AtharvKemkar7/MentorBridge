import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  size: number;
}

export interface UpdateUserStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private base = `${environment.apiBaseUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  list(params?: { page?: number; size?: number; search?: string; role?: string; status?: string }): Observable<AdminUserListResponse> {
    let hp = new HttpParams();
    if (params?.page) hp = hp.set('page', params.page);
    if (params?.size) hp = hp.set('size', params.size);
    if (params?.search) hp = hp.set('search', params.search);
    if (params?.role) hp = hp.set('role', params.role);
    if (params?.status) hp = hp.set('status', params.status);
    return this.http.get<AdminUserListResponse>(this.base, { params: hp });
  }

  get(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.base}/${id}`);
  }

  updateStatus(id: string, payload: UpdateUserStatusRequest): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.base}/${id}/status`, payload);
  }
}