export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export type NotificationType = 
  | 'MENTORSHIP_REQUEST_RECEIVED'
  | 'MENTORSHIP_REQUEST_ACCEPTED'
  | 'MENTORSHIP_REQUEST_REJECTED'
  | 'MENTORSHIP_REQUEST_CANCELLED'
  | 'MENTORSHIP_STARTED'
  | 'MENTORSHIP_PAUSED'
  | 'MENTORSHIP_RESUMED'
  | 'MENTORSHIP_ENDED'
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_RESCHEDULED'
  | 'BOOKING_REMINDER'
  | 'SESSION_STARTED'
  | 'SESSION_COMPLETED'
  | 'SESSION_CANCELLED'
  | 'SESSION_REMINDER'
  | 'REVIEW_RECEIVED'
  | 'REVIEW_PUBLISHED'
  | 'PROFILE_VERIFIED'
  | 'SYSTEM_ANNOUNCEMENT';

export interface NotificationData {
  mentorshipRequestId?: string;
  mentorshipId?: string;
  bookingId?: string;
  sessionId?: string;
  reviewId?: string;
  userId?: string;
  [key: string]: any;
}

export interface NotificationFilters {
  type?: NotificationType[];
  read?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface NotificationPageResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  unreadCount: number;
}

export interface MarkNotificationsReadDto {
  notificationIds: string[];
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  'MENTORSHIP_REQUEST_RECEIVED': 'Mentorship Request Received',
  'MENTORSHIP_REQUEST_ACCEPTED': 'Mentorship Request Accepted',
  'MENTORSHIP_REQUEST_REJECTED': 'Mentorship Request Rejected',
  'MENTORSHIP_REQUEST_CANCELLED': 'Mentorship Request Cancelled',
  'MENTORSHIP_STARTED': 'Mentorship Started',
  'MENTORSHIP_PAUSED': 'Mentorship Paused',
  'MENTORSHIP_RESUMED': 'Mentorship Resumed',
  'MENTORSHIP_ENDED': 'Mentorship Ended',
  'BOOKING_CREATED': 'Booking Created',
  'BOOKING_CONFIRMED': 'Booking Confirmed',
  'BOOKING_CANCELLED': 'Booking Cancelled',
  'BOOKING_RESCHEDULED': 'Booking Rescheduled',
  'BOOKING_REMINDER': 'Booking Reminder',
  'SESSION_STARTED': 'Session Started',
  'SESSION_COMPLETED': 'Session Completed',
  'SESSION_CANCELLED': 'Session Cancelled',
  'SESSION_REMINDER': 'Session Reminder',
  'REVIEW_RECEIVED': 'Review Received',
  'REVIEW_PUBLISHED': 'Review Published',
  'PROFILE_VERIFIED': 'Profile Verified',
  'SYSTEM_ANNOUNCEMENT': 'System Announcement',
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  'MENTORSHIP_REQUEST_RECEIVED': 'person_add',
  'MENTORSHIP_REQUEST_ACCEPTED': 'check_circle',
  'MENTORSHIP_REQUEST_REJECTED': 'cancel',
  'MENTORSHIP_REQUEST_CANCELLED': 'block',
  'MENTORSHIP_STARTED': 'play_circle',
  'MENTORSHIP_PAUSED': 'pause_circle',
  'MENTORSHIP_RESUMED': 'play_arrow',
  'MENTORSHIP_ENDED': 'stop_circle',
  'BOOKING_CREATED': 'event',
  'BOOKING_CONFIRMED': 'event_available',
  'BOOKING_CANCELLED': 'event_busy',
  'BOOKING_RESCHEDULED': 'update',
  'BOOKING_REMINDER': 'schedule',
  'SESSION_STARTED': 'videocam',
  'SESSION_COMPLETED': 'check_circle_outline',
  'SESSION_CANCELLED': 'videocam_off',
  'SESSION_REMINDER': 'alarm',
  'REVIEW_RECEIVED': 'star',
  'REVIEW_PUBLISHED': 'rate_review',
  'PROFILE_VERIFIED': 'verified',
  'SYSTEM_ANNOUNCEMENT': 'announcement',
};