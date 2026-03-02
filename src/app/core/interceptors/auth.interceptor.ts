import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../../layout/service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const token  = auth.token();
  const isAuth = req.url.includes('/api/auth/');

  // Skip: no token, or it's the login/refresh call itself
  if (!token || isAuth) return next(req);

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  );
};