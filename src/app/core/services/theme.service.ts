import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  darkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const isDark = this.darkMode();
      if (isPlatformBrowser(this.platformId)) {
        if (isDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }
    });
  }

  toggleDarkMode() {
    this.darkMode.update(dark => !dark);
  }

  private getInitialTheme(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('theme');
      if (stored) {
        return stored === 'dark';
      }
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    // Default for server-side
    return true; 
  }
}
