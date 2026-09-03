import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login', 'isLoading', 'error', 'userRole']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    authService.isLoading.and.returnValue(false);
    authService.error.and.returnValue(null);
    authService.userRole.and.returnValue('STUDENT');

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should validate email format', () => {
    const email = component.form.controls.email;
    email.setValue('invalid-email');
    expect(email.invalid).toBeTrue();
    
    email.setValue('valid@example.com');
    expect(email.valid).toBeTrue();
  });

  it('should require password', () => {
    const password = component.form.controls.password;
    expect(password.invalid).toBeTrue();
    
    password.setValue('password123');
    expect(password.valid).toBeTrue();
  });

  it('should call authService.login on valid submit', () => {
    const mockResponse = { accessToken: 'token', user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'STUDENT' as const } };
    authService.login.and.returnValue({ subscribe: (cb: any) => cb(mockResponse) } as any);

    component.form.patchValue({ email: 'john@example.com', password: 'password123' });
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({ email: 'john@example.com', password: 'password123' });
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });
});