export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  universityId?: string;
  graduationYear?: number;
  major?: string;
  skills: string[];
  careerInterests: string[];
  mentorshipAreas: string[];
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDashboardData {
  profileCompletion: number;
  activeMentorships: MentorshipSummary[];
  pendingRequests: MentorshipRequestSummary[];
  upcomingSessions: SessionSummary[];
  recentAlumni: AlumniSummary[];
  unreadNotifications: number;
}

export interface MentorshipSummary {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatarUrl?: string;
  mentorCurrentRole: string;
  mentorCompany: string;
  category: string;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  startDate: string;
  lastActivity?: string;
}

export interface MentorshipRequestSummary {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatarUrl?: string;
  category: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
  respondedAt?: string;
}

export interface SessionSummary {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatarUrl?: string;
  type: 'VIDEO' | 'AUDIO' | 'CHAT' | 'IN_PERSON';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
}

export interface AlumniSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  currentRole: string;
  company: string;
  experienceYears: number;
  skills: string[];
  expertise: string[];
  mentorshipAreas: string[];
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  averageRating?: number;
  totalReviews?: number;
}