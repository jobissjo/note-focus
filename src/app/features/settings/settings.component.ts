import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <header class="flex items-center justify-between mb-12">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Settings</h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-1">Manage your application preferences</p>
        </div>
      </header>

      <div class="space-y-8">
        <!-- Appearance -->
        <section class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <lucide-icon name="Palette" class="h-5 w-5 text-indigo-500" />
            Appearance
          </h2>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">Dark Mode</h3>
              <p class="text-sm text-neutral-500 mt-1">Toggle between light and dark themes</p>
            </div>
            
            <button 
              (click)="themeService.toggleDarkMode()"
              class="w-14 h-8 rounded-full transition-colors relative"
              [class.bg-indigo-500]="themeService.darkMode()"
              [class.bg-neutral-300]="!themeService.darkMode()"
              [class.dark:bg-neutral-700]="!themeService.darkMode()"
            >
              <div 
                class="absolute top-1 left-1 bg-white h-6 w-6 rounded-full transition-transform shadow flex items-center justify-center"
                [class.translate-x-6]="themeService.darkMode()"
              >
                <lucide-icon [name]="themeService.darkMode() ? 'Moon' : 'Sun'" class="h-3 w-3 text-neutral-800" />
              </div>
            </button>
          </div>
        </section>

        <!-- Account Settings -->
        <section class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <lucide-icon name="User" class="h-5 w-5 text-indigo-500" />
            Account
          </h2>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">Profile Settings</h3>
              <p class="text-sm text-neutral-500 mt-1">Update your personal information</p>
            </div>
            <button 
              routerLink="/dashboard/profile"
              class="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg text-sm font-semibold transition-colors dark:text-white text-neutral-900"
            >
              Manage Profile
            </button>
          </div>
        </section>

        <!-- Notifications -->
        <section class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 opacity-75 hover:border-indigo-500/50 transition-colors">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <lucide-icon name="Bell" class="h-5 w-5 text-indigo-500" />
            Notifications <span class="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-0.5 rounded-full ml-2">Coming Soon</span>
          </h2>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">Email Notifications</h3>
              <p class="text-sm text-neutral-500 mt-1">Receive updates via email</p>
            </div>
            
            <button class="w-14 h-8 rounded-full transition-colors relative bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed">
              <div class="absolute top-1 left-1 bg-white h-6 w-6 rounded-full shadow translate-x-0"></div>
            </button>
          </div>
        </section>
      </div>
    </div>
  `
})
export class SettingsComponent {
  themeService = inject(ThemeService);
}
