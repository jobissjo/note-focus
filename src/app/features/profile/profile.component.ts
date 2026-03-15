import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <header class="flex items-center justify-between mb-12">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Profile</h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-1">Manage your account information</p>
        </div>
      </header>

      <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <!-- Cover Photo area (decorative) -->
        <div class="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>
        
        <div class="px-8 pb-8">
          <!-- User Avatar -->
          <div class="relative -mt-12 mb-6">
            <div class="h-24 w-24 rounded-2xl bg-white dark:bg-neutral-800 p-2 shadow-lg border border-neutral-200 dark:border-neutral-700">
              <div class="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {{ userInitials() }}
              </div>
            </div>
          </div>

          <!-- User Details Info -->
          <div class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Personal Information</h2>
              <p class="text-sm text-neutral-500 mt-1">Your basic profile information</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
                <div class="w-full bg-neutral-100 dark:bg-neutral-800/50 border border-transparent rounded-xl py-3 px-4 flex items-center gap-3">
                  <lucide-icon name="User" class="h-4 w-4 text-neutral-400" />
                  <span class="text-neutral-900 dark:text-white font-medium">{{ user()?.name || 'User' }}</span>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email Address</label>
                <div class="w-full bg-neutral-100 dark:bg-neutral-800/50 border border-transparent rounded-xl py-3 px-4 flex items-center gap-3">
                  <lucide-icon name="Mail" class="h-4 w-4 text-neutral-400" />
                  <span class="text-neutral-900 dark:text-white font-medium">{{ user()?.email }}</span>
                </div>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <h3 class="text-red-500 font-bold mb-4 flex items-center gap-2">
                <lucide-icon name="AlertTriangle" class="h-5 w-5" />
                Danger Zone
              </h3>
              <div class="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-red-900 dark:text-red-400">Delete Account</h4>
                  <p class="text-sm text-red-700 dark:text-red-500/80 mt-1">Permanently remove your account and all data</p>
                </div>
                <button class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-500/20 opacity-50 cursor-not-allowed">
                  Delete Account
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  authService = inject(AuthService);
  user = this.authService.currentUser;

  userInitials() {
    const defaultName = 'User';
    const email = this.user()?.email || '';
    const namePart = (this.user() as any)?.name ? (this.user() as any).name : email.split('@')[0];
    return (namePart || defaultName).substring(0, 1).toUpperCase();
  }
}
