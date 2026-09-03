export interface AlumniProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  currentRole: string;
  company: string;
  experienceYears: number;
  skills: string[];
  expertise: string[];
  careerInterests: string[];
  mentorshipAreas: string[];
  availability: AvailabilitySlot[];
  sessionTypes: SessionType[];
  timezone: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: { [key: number]: number };
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
}

export interface SessionType {
  id: string;
  name: string;
  durationMinutes: number;
  description?: string;
}

export interface AlumniDashboardData {
  pendingRequests: MentorshipRequestSummary[];
  activeMentees: MenteeSummary[];
  upcomingSessions: SessionSummary[];
  completedSessionsCount: number;
  availabilitySummary: AvailabilitySummary;
  unreadNotifications: number;
  ratingSummary?: RatingSummary;
}

export interface MenteeSummary {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatarUrl?: string;
  studentMajor?: string;
  studentGraduationYear?: number;
  category: string;
  startDate: string;
  lastSessionDate?: string;
  nextSessionDate?: string;
}

export interface AvailabilitySummary {
  totalSlots: number;
  activeSlots: number;
  sessionTypesConfigured: number;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}

export interface MentorshipRequestSummary {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatarUrl?: string;
  studentMajor?: string;
  studentGraduationYear?: number;
  category: string;
  message: string;
  requestedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
}

export interface SessionSummary {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatarUrl?: string;
  type: 'VIDEO' | 'AUDIO' | 'CHAT' | 'IN_PERSON';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
}