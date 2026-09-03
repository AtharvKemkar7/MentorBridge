import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};

export const guestGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return true;
  const role = auth.userRole();
  if (role === 'STUDENT') router.navigate(['/student/dashboard']);
  else if (role === 'ALUMNI') router.navigate(['/alumni/dashboard']);
  else if (role === 'ADMIN') router.navigate(['/admin/dashboard']);
  else router.navigate(['/']);
  return false;
};

export const roleGuard = (allowedRoles: string[]) => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) { router.navigate(['/login']); return false; }
  const role = auth.userRole();
  if (role && allowedRoles.includes(role)) return true;
  router.navigate(['/']);
  return false;
};