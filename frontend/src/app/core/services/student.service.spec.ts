import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { StudentProfile, StudentDashboardData, AlumniSummary } from '../models/student.model';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api-response.model';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentService]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should fetch student profile', () => {
      const mockProfile: StudentProfile = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        skills: ['JavaScript', 'TypeScript'],
        careerInterests: ['Software Engineering'],
        mentorshipAreas: ['Career Guidance'],
        profileCompletion: 80,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      service.getProfile().subscribe(profile => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/students/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  describe('searchAlumni', () => {
    it('should search alumni with filters', () => {
      const mockResponse: PaginatedResponse<AlumniSummary> = {
        content: [
          {
            id: '1',
            firstName: 'Jane',
            lastName: 'Smith',
            currentRole: 'Senior Engineer',
            company: 'Tech Corp',
            experienceYears: 8,
            skills: ['React', 'Node.js'],
            expertise: ['Frontend'],
            mentorshipAreas: ['Career Guidance'],
            availabilityStatus: 'AVAILABLE',
            verificationStatus: 'VERIFIED',
            averageRating: 4.5,
            totalReviews: 10
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      service.searchAlumni({ query: 'Jane', skills: ['React'] }).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiBaseUrl}/api/alumni/search` &&
        req.params.get('query') === 'Jane' &&
        req.params.get('skills') === 'React'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getDashboard', () => {
    it('should fetch dashboard data', () => {
      const mockDashboard: StudentDashboardData = {
        profileCompletion: 80,
        activeMentorships: [],
        pendingRequests: [],
        upcomingSessions: [],
        recentAlumni: [],
        unreadNotifications: 5
      };

      service.getDashboard().subscribe(dashboard => {
        expect(dashboard).toEqual(mockDashboard);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/students/dashboard`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboard);
    });
  });
});