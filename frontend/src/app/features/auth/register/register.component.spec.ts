import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['register', 'isLoading', 'error', 'userRole']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    authService.isLoading.and.returnValue(false);
    authService.error.and.returnValue(null);
    authService.userRole.and.returnValue('STUDENT');

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should require first name and last name', () => {
    expect(component.fn.invalid).toBeTrue();
    expect(component.ln.invalid).toBeTrue();
    
    component.fn.setValue('John');
    component.ln.setValue('Doe');
    expect(component.fn.valid).toBeTrue();
    expect(component.ln.valid).toBeTrue();
  });

  it('should validate email format', () => {
    component.email.setValue('invalid');
    expect(component.email.invalid).toBeTrue();
    
    component.email.setValue('valid@example.com');
    expect(component.email.valid).toBeTrue();
  });

  it('should enforce password strength', () => {
    component.pwd.setValue('weak');
    expect(component.pwd.invalid).toBeTrue();
    
    component.pwd.setValue('StrongPass1');
    expect(component.pwd.valid).toBeTrue();
  });

  it('should require password confirmation match', () => {
    component.pwd.setValue('StrongPass1');
    component.cpwd.setValue('Different1');
    expect(component.form.invalid).toBeTrue();
    
    component.cpwd.setValue('StrongPass1');
    expect(component.form.valid).toBeTrue();
  });

  it('should call authService.register on valid submit', () => {
    const mockResponse = { accessToken: 'token', user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'STUDENT' as const } };
    authService.register.and.returnValue({ subscribe: (cb: any) => cb(mockResponse) } as any);

    component.form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'STUDENT',
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1'
    });
    component.onSubmit();

    expect(authService.register).toHaveBeenCalled();
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });
});