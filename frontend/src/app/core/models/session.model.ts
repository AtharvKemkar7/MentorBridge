export interface Session {
  id: string;
  bookingId: string;
  studentId: string;
  mentorId: string;
  sessionTypeId: string;
  sessionTypeName: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  durationMinutes: number;
  timezone: string;
  meetingLink?: string;
  recordingUrl?: string;
  notes?: string;
  studentFeedback?: string;
  mentorFeedback?: string;
  createdAt: string;
  updatedAt: string;
  student?: SessionUserSummary;
  mentor?: SessionUserSummary;
}

export interface SessionUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  email: string;
}

export interface SessionFilters {
  status?: string[];
  startDate?: string;
  endDate?: string;
  mentorId?: string;
  studentId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface SessionPageResponse {
  content: Session[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CompleteSessionDto {
  sessionId: string;
  notes?: string;
  recordingUrl?: string;
}

export interface SessionFeedbackDto {
  sessionId: string;
  feedback: string;
  role: 'STUDENT' | 'MENTOR';
}