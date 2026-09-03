import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Booking,
  CreateBookingDto,
  RescheduleBookingDto,
  CancelBookingDto,
  AvailableSlot,
  BookingFilters,
  BookingPageResponse
} from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  createBooking(payload: CreateBookingDto): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiBase}/api/bookings`, payload);
  }

  getStudentBookings(filters?: BookingFilters): Observable<BookingPageResponse> {
    return this.http.get<BookingPageResponse>(`${this.apiBase}/api/bookings/student`, { params: filters as any });
  }

  getAlumniBookings(filters?: BookingFilters): Observable<BookingPageResponse> {
    return this.http.get<BookingPageResponse>(`${this.apiBase}/api/bookings/alumni`, { params: filters as any });
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiBase}/api/bookings/${id}`);
  }

  rescheduleBooking(payload: RescheduleBookingDto): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiBase}/api/bookings/${payload.bookingId}/reschedule`, payload);
  }

  cancelBooking(payload: CancelBookingDto): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiBase}/api/bookings/${payload.bookingId}/cancel`, payload);
  }

  getAvailableSlots(mentorId: string, startDate: string, endDate: string): Observable<AvailableSlot[]> {
    return this.http.get<AvailableSlot[]>(`${this.apiBase}/api/bookings/slots`, {
      params: { mentorId, startDate, endDate }
    });
  }
}