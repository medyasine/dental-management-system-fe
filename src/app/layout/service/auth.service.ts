import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload { exp: number; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'dpms_token';
  private readonly ROLES_KEY = 'dpms_roles';

  // ─── Reactive signal — components subscribe to this ───
  private readonly _authenticated = signal<boolean>(this.checkAuth());
  readonly isAuthenticated$ = this._authenticated.asReadonly();

  constructor(private http: HttpClient) {}

  // ─── Login ───────────────────────────────────────────
  login(payload: { username: string; password: string }) {
    return this.http
      .post<any>('/api/auth/login', payload)
      .pipe(
        tap(res => {
          sessionStorage.setItem(this.TOKEN_KEY, res.accessToken);
          sessionStorage.setItem(this.ROLES_KEY, JSON.stringify(res.roles ?? []));
          this._authenticated.set(true);   // ← notify all listeners
        })
      );
  }

  // ─── Logout ──────────────────────────────────────────
  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.ROLES_KEY);
    this._authenticated.set(false);     // ← notify all listeners
  }

  // ─── Token ───────────────────────────────────────────
  token(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // ─── Roles (safe parse) ──────────────────────────────
  roles(): string[] {
    try {
      const parsed = JSON.parse(
        sessionStorage.getItem(this.ROLES_KEY) ?? '[]'
      );
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // ─── isAuthenticated: checks EXPIRY, not just presence ─
  private checkAuth(): boolean {
    const t = this.token();
    if (!t) return false;
    try {
      const { exp } = jwtDecode<JwtPayload>(t);
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  }

  // ─── hasRole ─────────────────────────────────────────
  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }
}