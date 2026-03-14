import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse, User } from '../interfaces';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseApiService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  // Signals
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    super();
    if (this.isBrowser) {
      this.isAuthenticated.set(!!localStorage.getItem('token'));
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.post<AuthResponse>('auth/login', credentials).pipe(
      tap((res) => {
        this.handleAuthSub(res);
      })
    );
  }

  register(userData: any) {
    return this.post<AuthResponse>('auth/register', userData).pipe(
      tap((res) => {
        this.handleAuthSub(res);
      })
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  private handleAuthSub(res: AuthResponse) {
    if (this.isBrowser) {
      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    this.currentUser.set(res.user);
    this.isAuthenticated.set(true);
    this.router.navigate(['/dashboard']);
  }

  // Optional: Check session on startup
  checkSession() {
    if (!this.isBrowser) return;
    
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token) {
      this.currentUser.set(JSON.parse(userStr));
      this.isAuthenticated.set(true);
    }
  }
}
