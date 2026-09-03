import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  status: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, any>;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private base = `${environment.apiBaseUrl}/admin/audit-logs`;

  constructor(private http: HttpClient) {}

  list(params?: { page?: number; size?: number; action?: string; actor?: string; from?: string; to?: string }): Observable<AuditLogListResponse> {
    let hp = new HttpParams();
    if (params?.page) hp = hp.set('page', params.page);
    if (params?.size) hp = hp.set('size', params.size);
    if (params?.action) hp = hp.set('action', params.action);
    if (params?.actor) hp = hp.set('actor', params.actor);
    if (params?.from) hp = hp.set('from', params.from);
    if (params?.to) hp = hp.set('to', params.to);
    return this.http.get<AuditLogListResponse>(this.base, { params: hp });
  }
}