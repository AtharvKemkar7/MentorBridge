export interface Booking {
  id: string;
  studentId: string;
  mentorId: string;
  sessionTypeId: string;
  sessionTypeName: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED';
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  meetingLink?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: 'STUDENT' | 'MENTOR';
  createdAt: string;
  updatedAt: string;
  student?: BookingUserSummary;
  mentor?: BookingUserSummary;
}

export interface BookingUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  email: string;
  timezone?: string;
}

export interface CreateBookingDto {
  mentorId: string;
  sessionTypeId: string;
  scheduledAt: string;
  timezone: string;
  notes?: string;
}

export interface RescheduleBookingDto {
  bookingId: string;
  newScheduledAt: string;
  timezone: string;
  reason?: string;
}

export interface CancelBookingDto {
  bookingId: string;
  reason: string;
}

export interface AvailableSlot {
  id: string;
  mentorId: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionTypeId: string;
  sessionTypeName: string;
  durationMinutes: number;
  timezone: string;
  isBooked: boolean;
}

export interface BookingFilters {
  status?: string[];
  startDate?: string;
  endDate?: string;
  mentorId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface BookingPageResponse {
  content: Booking[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}