import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { StudentDashboardComponent } from './features/student/dashboard/student-dashboard.component';
import { AlumniDashboardComponent } from './features/alumni/dashboard/alumni-dashboard.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { StudentProfileComponent } from './features/student/profile/student-profile.component';
import { AlumniProfileComponent } from './features/alumni/profile/alumni-profile.component';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
      { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [guestGuard] },
      { path: 'reset-password', component: ResetPasswordComponent, canActivate: [guestGuard] },

      // Student area
      {
        path: 'student',
        canActivate: [authGuard, () => roleGuard(['STUDENT'])],
        children: [
          { path: 'dashboard', component: StudentDashboardComponent },
          { path: 'profile', component: StudentProfileComponent },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      // Alumni area
      {
        path: 'alumni',
        canActivate: [authGuard, () => roleGuard(['ALUMNI'])],
        children: [
          { path: 'dashboard', component: AlumniDashboardComponent },
          { path: 'profile', component: AlumniProfileComponent },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      // Admin area
      {
        path: 'admin',
        canActivate: [authGuard, () => roleGuard(['ADMIN'])],
        children: [
          { path: 'dashboard', component: AdminDashboardComponent },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];