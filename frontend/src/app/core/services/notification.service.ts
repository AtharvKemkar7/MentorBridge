import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Notification,
  NotificationFilters,
  NotificationPageResponse,
  MarkNotificationsReadDto
} from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  private _notifications = signal<Notification[]>([]);
  private _unreadCount = signal(0);
  private _loading = signal(false);
  private _totalElements = signal(0);
  private _totalPages = signal(0);
  private _currentPage = signal(1);

  notifications = this._notifications.asReadonly();
  unreadCount = this._unreadCount.asReadonly();
  isLoading = this._loading.asReadonly();
  totalElements = this._totalElements.asReadonly();
  totalPages = this._totalPages.asReadonly();
  currentPage = this._currentPage.asReadonly();

  loadNotifications(filters: NotificationFilters = {}): Observable<NotificationPageResponse> {
    this._loading.set(true);
    const params = { ...filters, page: filters.page ?? this._currentPage() };
    return this.http.get<NotificationPageResponse>(`${this.apiBase}/api/notifications`, { params: params as any }).pipe(
      tap(response => {
        if (params.page === 1 || !params.page) {
          this._notifications.set(response.content);
        } else {
          this._notifications.update(current => [...current, ...response.content]);
        }
        this._totalElements.set(response.totalElements);
        this._totalPages.set(response.totalPages);
        this._currentPage.set(response.number + 1);
        this._unreadCount.set(response.unreadCount);
      }),
      tap(() => this._loading.set(false))
    );
  }

  loadMore(filters: NotificationFilters = {}): Observable<NotificationPageResponse> {
    if (this._currentPage() >= this._totalPages()) {
      return new Observable(subscriber => subscriber.complete());
    }
    return this.loadNotifications({ ...filters, page: this._currentPage() + 1 });
  }

  markAsRead(notificationIds: string[]): Observable<void> {
    const dto: MarkNotificationsReadDto = { notificationIds };
    return this.http.put<void>(`${this.apiBase}/api/notifications/read`, dto).pipe(
      tap(() => {
        this._notifications.update(notifs =>
          notifs.map(n => notificationIds.includes(n.id) ? { ...n, read: true, readAt: new Date().toISOString() } : n)
        );
        this._unreadCount.update(count => Math.max(0, count - notificationIds.length));
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiBase}/api/notifications/read-all`, {}).pipe(
      tap(() => {
        this._notifications.update(notifs => notifs.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
        this._unreadCount.set(0);
      })
    );
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiBase}/api/notifications/unread-count`).pipe(
      tap(res => this._unreadCount.set(res.count))
    );
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}