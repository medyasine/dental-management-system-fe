import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../layout/service/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        auth.logout();                        // clears storage + updates signal
        router.navigateByUrl('/login');
      }
      if (err.status === 403) {
        router.navigateByUrl('/forbidden');
      }
      return throwError(() => err);           // re-throw for component handling
    })
  );
};