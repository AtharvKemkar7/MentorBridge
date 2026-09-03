import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard, guestGuard, roleGuard } from './auth.guard';

describe('Auth Guards', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'userRole']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  describe('authGuard', () => {
    it('should allow access when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      const result = TestBed.runInInjectionContext(authGuard);
      expect(result).toBeTrue();
    });

    it('should redirect to login when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      const result = TestBed.runInInjectionContext(authGuard);
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('guestGuard', () => {
    it('should allow access when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      const result = TestBed.runInInjectionContext(guestGuard);
      expect(result).toBeTrue();
    });

    it('should redirect to dashboard when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.userRole.and.returnValue('STUDENT');
      const result = TestBed.runInInjectionContext(guestGuard);
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/student/dashboard']);
    });
  });

  describe('roleGuard', () => {
    it('should allow access when user has required role', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.userRole.and.returnValue('ADMIN');
      const result = TestBed.runInInjectionContext(() => roleGuard(['ADMIN'])());
      expect(result).toBeTrue();
    });

    it('should deny access when user lacks required role', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.userRole.and.returnValue('STUDENT');
      const result = TestBed.runInInjectionContext(() => roleGuard(['ADMIN'])());
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should redirect to login when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      const result = TestBed.runInInjectionContext(() => roleGuard(['ADMIN'])());
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});