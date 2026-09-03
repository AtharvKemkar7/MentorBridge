import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminDashboardStats {
  pendingVerifications: number;
  totalStudents: number;
  totalAlumni: number;
  activeMentorships: number;
  pendingMentorshipRequests: number;
  recentReviews: number;
  recentActivity: ActivityItem[];
  systemHealth: SystemHealth;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'UP' | 'DOWN';
  latencyMs?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiBaseUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.base}/dashboard`);
  }

  getRecentActivity(params?: { page?: number; size?: number }): Observable<{ items: ActivityItem[]; total: number }> {
    let hp = new HttpParams();
    if (params?.page) hp = hp.set('page', params.page);
    if (params?.size) hp = hp.set('size', params.size);
    return this.http.get<{ items: ActivityItem[]; total: number }>(`${this.base}/activity`, { params: hp });
  }
}