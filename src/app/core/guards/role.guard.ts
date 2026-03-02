import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../layout/service/auth.service';

/**
 * roleGuard(['ADMIN','DENTIST'])
 * → allows if user has AT LEAST ONE of the provided roles
 */
export const roleGuard =
  (roles: string[]): CanActivateFn =>
  () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (roles.some(r => auth.hasRole(r))) return true;

    router.navigateByUrl('/forbidden');
    return false;
  };