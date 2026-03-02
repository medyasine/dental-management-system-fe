import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../layout/service/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Uses checkAuth() internally — respects token expiry
  if (auth.isAuthenticated$()) return true;

  router.navigateByUrl('/login');
  return false;
};