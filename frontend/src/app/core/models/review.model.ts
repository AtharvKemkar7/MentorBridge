export interface Review {
  id: string;
  sessionId: string;
  studentId: string;
  mentorId: string;
  rating: number;
  comment: string;
  status: 'PUBLISHED' | 'PENDING_MODERATION' | 'REJECTED' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;
  student?: ReviewUserSummary;
  mentor?: ReviewUserSummary;
  session?: ReviewSessionSummary;
}

export interface ReviewUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface ReviewSessionSummary {
  id: string;
  sessionType: string;
  scheduledAt: string;
}

export interface CreateReviewDto {
  sessionId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewDto {
  rating: number;
  comment: string;
}

export interface ReviewFilters {
  mentorId?: string;
  studentId?: string;
  status?: string[];
  minRating?: number;
  maxRating?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ReviewPageResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ReviewEligibility {
  eligible: boolean;
  sessionId: string;
  reason?: string;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}