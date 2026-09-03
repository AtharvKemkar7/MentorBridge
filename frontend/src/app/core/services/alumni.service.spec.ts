import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AlumniService } from './alumni.service';
import { AlumniProfile, AlumniDashboardData, AvailabilitySlot, SessionType } from '../models/alumni.model';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api-response.model';

describe('AlumniService', () => {
  let service: AlumniService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AlumniService]
    });
    service = TestBed.inject(AlumniService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should fetch alumni profile', () => {
      const mockProfile: AlumniProfile = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        currentRole: 'Senior Engineer',
        company: 'Tech Corp',
        experienceYears: 8,
        skills: ['React', 'Node.js'],
        expertise: ['Frontend'],
        careerInterests: ['Engineering Leadership'],
        mentorshipAreas: ['Career Guidance'],
        availability: [],
        sessionTypes: [],
        timezone: 'UTC',
        verificationStatus: 'VERIFIED',
        averageRating: 4.5,
        totalReviews: 10,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      service.getProfile().subscribe(profile => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/alumni/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  describe('getDashboard', () => {
    it('should fetch alumni dashboard data', () => {
      const mockDashboard: AlumniDashboardData = {
        pendingRequests: [],
        activeMentees: [],
        upcomingSessions: [],
        completedSessionsCount: 5,
        availabilitySummary: {
          totalSlots: 10,
          activeSlots: 8,
          sessionTypesConfigured: 3
        },
        unreadNotifications: 3,
        ratingSummary: {
          averageRating: 4.5,
          totalReviews: 10,
          distribution: { 5: 5, 4: 3, 3: 2, 2: 0, 1: 0 }
        }
      };

      service.getDashboard().subscribe(dashboard => {
        expect(dashboard).toEqual(mockDashboard);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/alumni/dashboard`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboard);
    });
  });

  describe('getAvailability', () => {
    it('should fetch availability slots', () => {
      const mockSlots: AvailabilitySlot[] = [
        {
          id: '1',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '10:00',
          isRecurring: true
        }
      ];

      service.getAvailability().subscribe(slots => {
        expect(slots).toEqual(mockSlots);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/alumni/availability`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSlots);
    });
  });

  describe('getSessionTypes', () => {
    it('should fetch session types', () => {
      const mockTypes: SessionType[] = [
        { id: '1', name: 'Resume Review', durationMinutes: 30, description: 'Review your resume' },
        { id: '2', name: 'Mock Interview', durationMinutes: 60, description: 'Practice interview' }
      ];

      service.getSessionTypes().subscribe(types => {
        expect(types).toEqual(mockTypes);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/alumni/session-types`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTypes);
    });
  });
});