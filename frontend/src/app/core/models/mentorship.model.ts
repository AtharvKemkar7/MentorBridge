export interface MentorshipRequest {
  id: string;
  studentId: string;
  mentorId: string;
  category: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
  respondedAt?: string;
  student?: MentorshipUserSummary;
  mentor?: MentorshipUserSummary;
}

export interface MentorshipUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  currentRole?: string;
  company?: string;
  major?: string;
  graduationYear?: number;
}

export interface Mentorship {
  id: string;
  studentId: string;
  mentorId: string;
  category: string;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  startDate: string;
  endDate?: string;
  pauseReason?: string;
  pausedAt?: string;
  student: MentorshipUserSummary;
  mentor: MentorshipUserSummary;
  latestActivity?: MentorshipActivity;
}

export interface MentorshipActivity {
  id: string;
  type: 'SESSION_COMPLETED' | 'MESSAGE_SENT' | 'REVIEW_SUBMITTED' | 'MENTORSHIP_PAUSED' | 'MENTORSHIP_RESUMED' | 'MENTORSHIP_ENDED';
  description: string;
  createdAt: string;
  actorId: string;
  actorName: string;
}

export interface CreateMentorshipRequestDto {
  mentorId: string;
  category: string;
  message: string;
}

export interface RespondToMentorshipRequestDto {
  requestId: string;
  action: 'ACCEPT' | 'REJECT';
}

export interface UpdateMentorshipDto {
  action: 'PAUSE' | 'RESUME' | 'END';
  reason?: string;
}

export type MentorshipCategory = 
  | 'CAREER_GUIDANCE'
  | 'RESUME_REVIEW'
  | 'MOCK_INTERVIEW'
  | 'PROJECT_GUIDANCE'
  | 'COMPANY_INSIGHTS'
  | 'SKILL_DEVELOPMENT'
  | 'NETWORKING'
  | 'GENERAL_MENTORSHIP';

export const MENTORSHIP_CATEGORIES: { value: MentorshipCategory; label: string }[] = [
  { value: 'CAREER_GUIDANCE', label: 'Career Guidance' },
  { value: 'RESUME_REVIEW', label: 'Resume Review' },
  { value: 'MOCK_INTERVIEW', label: 'Mock Interview' },
  { value: 'PROJECT_GUIDANCE', label: 'Project Guidance' },
  { value: 'COMPANY_INSIGHTS', label: 'Company Insights' },
  { value: 'SKILL_DEVELOPMENT', label: 'Skill Development' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'GENERAL_MENTORSHIP', label: 'General Mentorship' },
];