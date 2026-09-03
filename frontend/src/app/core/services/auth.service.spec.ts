import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set session', () => {
    const mockResponse = {
      accessToken: 'test-token',
      user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'STUDENT' as const }
    };

    service.login({ email: 'john@example.com', password: 'password123' }).subscribe();
    
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.accessToken()).toBe('test-token');
    expect(service.user()).toEqual(mockResponse.user);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should logout and clear session', () => {
    service['_accessToken'].set('test-token');
    service['_user'].set({ id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'STUDENT' });
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'STUDENT' }));

    service.logout();

    expect(service.accessToken()).toBeNull();
    expect(service.user()).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});