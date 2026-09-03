import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MentorshipService } from './mentorship.service';
import { MentorshipRequest, CreateMentorshipRequestDto, RespondToMentorshipRequestDto, Mentorship, UpdateMentorshipDto } from '../models/mentorship.model';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api-response.model';

describe('MentorshipService', () => {
  let service: MentorshipService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MentorshipService]
    });
    service = TestBed.inject(MentorshipService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createRequest', () => {
    it('should create a mentorship request', () => {
      const payload: CreateMentorshipRequestDto = {
        mentorId: 'mentor-1',
        category: 'CAREER_GUIDANCE',
        message: 'Looking for career guidance'
      };

      const mockResponse: MentorshipRequest = {
        id: 'request-1',
        studentId: 'student-1',
        mentorId: 'mentor-1',
        category: 'CAREER_GUIDANCE',
        message: 'Looking for career guidance',
        status: 'PENDING',
        requestedAt: '2024-01-01T00:00:00Z'
      };

      service.createRequest(payload).subscribe(request => {
        expect(request).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/mentorship/requests`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });
  });

  describe('getStudentRequests', () => {
    it('should fetch student mentorship requests', () => {
      const mockRequests: MentorshipRequest[] = [
        {
          id: '1',
          studentId: 'student-1',
          mentorId: 'mentor-1',
          category: 'CAREER_GUIDANCE',
          message: 'Need guidance',
          status: 'PENDING',
          requestedAt: '2024-01-01T00:00:00Z'
        }
      ];

      service.getStudentRequests().subscribe(requests => {
        expect(requests).toEqual(mockRequests);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/mentorship/requests/student`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRequests);
    });
  });

  describe('getAlumniRequests', () => {
    it('should fetch alumni mentorship requests with pagination', () => {
      const mockResponse: PaginatedResponse<MentorshipRequest> = {
        content: [
          {
            id: '1',
            studentId: 'student-1',
            mentorId: 'mentor-1',
            category: 'CAREER_GUIDANCE',
            message: 'Need guidance',
            status: 'PENDING',
            requestedAt: '2024-01-01T00:00:00Z'
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

      service.getAlumniRequests({ status: 'PENDING', page: 0, size: 10 }).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiBaseUrl}/api/mentorship/requests/alumni` &&
        req.params.get('status') === 'PENDING' &&
        req.params.get('page') === '0' &&
        req.params.get('size') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('respondToRequest', () => {
    it('should respond to a mentorship request', () => {
      const payload: RespondToMentorshipRequestDto = {
        requestId: 'request-1',
        action: 'ACCEPT'
      };

      const mockResponse: MentorshipRequest = {
        id: 'request-1',
        studentId: 'student-1',
        mentorId: 'mentor-1',
        category: 'CAREER_GUIDANCE',
        message: 'Need guidance',
        status: 'ACCEPTED',
        requestedAt: '2024-01-01T00:00:00Z',
        respondedAt: '2024-01-02T00:00:00Z'
      };

      service.respondToRequest(payload).subscribe(request => {
        expect(request).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/mentorship/requests/respond`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });
  });

  describe('cancelRequest', () => {
    it('should cancel a mentorship request', () => {
      service.cancelRequest('request-1').subscribe(() => {
        expect(true).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/mentorship/requests/request-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateMentorship', () => {
    it('should update mentorship status', () => {
      const payload: UpdateMentorshipDto = {
        action: 'PAUSE',
        reason: 'Busy schedule'
      };

      const mockResponse: Mentorship = {
        id: 'mentorship-1',
        studentId: 'student-1',
        mentorId: 'mentor-1',
        category: 'CAREER_GUIDANCE',
        status: 'PAUSED',
        startDate: '2024-01-01T00:00:00Z',
        pausedAt: '2024-02-01T00:00:00Z',
        pauseReason: 'Busy schedule',
        student: { id: 'student-1', firstName: 'John', lastName: 'Doe' },
        mentor: { id: 'mentor-1', firstName: 'Jane', lastName: 'Smith' }
      };

      service.updateMentorship(payload).subscribe(mentorship => {
        expect(mentorship).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/mentorship`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });
  });

  describe('getCategories', () => {
    it('should return mentorship categories', () => {
      const categories = service.getCategories();
      expect(categories).toContain('CAREER_GUIDANCE');
      expect(categories).toContain('RESUME_REVIEW');
      expect(categories).toContain('MOCK_INTERVIEW');
    });
  });
});