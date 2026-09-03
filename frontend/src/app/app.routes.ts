import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
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
          { path: 'dashboard', loadComponent: () => import('./features/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent) },
          { path: 'profile', loadComponent: () => import('./features/student/profile/student-profile.component').then(m => m.StudentProfileComponent) },
          { path: 'alumni', loadComponent: () => import('./features/student/alumni/student-alumni-directory.component').then(m => m.StudentAlumniDirectoryComponent) },
          { path: 'alumni/:id', loadComponent: () => import('./features/student/alumni-detail/student-alumni-detail.component').then(m => m.StudentAlumniDetailComponent) },
          { path: 'mentorship', loadComponent: () => import('./features/student/mentorship/student-mentorships.component').then(m => m.StudentMentorshipsComponent) },
          { path: 'mentorship/requests', loadComponent: () => import('./features/student/mentorship-requests/student-mentorship-requests.component').then(m => m.StudentMentorshipRequestsComponent) },
          { path: 'bookings', loadComponent: () => import('./features/student/bookings/student-bookings.component').then(m => m.StudentBookingsComponent) },
          { path: 'sessions', loadComponent: () => import('./features/student/sessions/student-sessions.component').then(m => m.StudentSessionsComponent) },
          { path: 'reviews', loadComponent: () => import('./features/student/reviews/student-reviews.component').then(m => m.StudentReviewsComponent) },
          { path: 'notifications', loadComponent: () => import('./features/student/notifications/student-notifications.component').then(m => m.StudentNotificationsComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      // Alumni area
      {
        path: 'alumni',
        canActivate: [authGuard, () => roleGuard(['ALUMNI'])],
        children: [
          { path: 'dashboard', loadComponent: () => import('./features/alumni/dashboard/alumni-dashboard.component').then(m => m.AlumniDashboardComponent) },
          { path: 'profile', loadComponent: () => import('./features/alumni/profile/alumni-profile.component').then(m => m.AlumniProfileComponent) },
          { path: 'requests', loadComponent: () => import('./features/alumni/requests/alumni-requests.component').then(m => m.AlumniRequestsComponent) },
          { path: 'mentorships', loadComponent: () => import('./features/alumni/mentorships/alumni-mentorships.component').then(m => m.AlumniMentorshipsComponent) },
          { path: 'availability', loadComponent: () => import('./features/alumni/availability/alumni-availability.component').then(m => m.AlumniAvailabilityComponent) },
          { path: 'bookings', loadComponent: () => import('./features/alumni/bookings/alumni-bookings.component').then(m => m.AlumniBookingsComponent) },
          { path: 'sessions', loadComponent: () => import('./features/alumni/sessions/alumni-sessions.component').then(m => m.AlumniSessionsComponent) },
          { path: 'reviews', loadComponent: () => import('./features/alumni/reviews/alumni-reviews.component').then(m => m.AlumniReviewsComponent) },
          { path: 'notifications', loadComponent: () => import('./features/alumni/notifications/alumni-notifications.component').then(m => m.AlumniNotificationsComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      // Admin area
      {
        path: 'admin',
        canActivate: [authGuard, () => roleGuard(['ADMIN'])],
        children: [
          { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];