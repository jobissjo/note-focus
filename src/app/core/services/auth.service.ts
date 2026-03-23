import Swal from 'sweetalert2';
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
      localStorage.setItem('token', res.accessToken || res?.access_token || '');
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    this.currentUser.set(res.user);
    this.isAuthenticated.set(true);
    this.router.navigate(['/dashboard']);
  }

  setPin(pin: string) {
    return this.post<{ message: string }>('auth/set-pin', { pin }).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user) {
          const updatedUser = { ...user, hasPin: true };
          this.currentUser.set(updatedUser);
          if (this.isBrowser) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      })
    );
  }

  verifyPin(pin: string) {
    return this.post<{ success: boolean }>('auth/verify-pin', { pin });
  }

  async requestPinVerification(title: string = 'Security PIN Required', text: string = 'Please enter your security PIN to proceed.'): Promise<boolean> {
    const isDark = document.documentElement.classList.contains('dark');
    const { value: pin } = await Swal.fire({
      title,
      text,
      input: 'password',
      inputPlaceholder: 'Enter PIN',
      inputAttributes: {
        maxlength: '10',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Verify',
      confirmButtonColor: 'var(--accent)',
      background: isDark ? '#171717' : '#ffffff',
      color: isDark ? '#ffffff' : '#171717',
      customClass: {
        popup: 'rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl',
        input: 'rounded-xl border border-neutral-200 dark:border-neutral-800'
      }
    });

    if (!pin) return false;

    return new Promise((resolve) => {
      this.verifyPin(pin).subscribe({
        next: (res) => resolve(res.success),
        error: () => resolve(false)
      });
    });
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
