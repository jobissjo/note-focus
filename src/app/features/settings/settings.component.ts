import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { LucideAngularModule } from 'lucide-angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-full px-8 py-10 max-w-4xl mx-auto" style="font-family: var(--font-sans);">
      <!-- Page Header -->
      <header class="mb-10">
        <div class="flex items-center gap-2.5 mb-2">
          <div class="h-9 w-9 rounded-xl flex items-center justify-center" style="background: var(--accent-soft);">
            <lucide-icon name="Settings" class="h-5 w-5" style="color: var(--accent);" />
          </div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary);">Settings</h1>
        </div>
        <p class="text-sm" style="color: var(--text-muted);">Manage your application preferences.</p>
      </header>

      <div class="space-y-4">
        <!-- Appearance -->
        <section class="rounded-2xl p-6 transition-all" style="
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-sm);
        ">
          <h2 class="text-sm font-bold flex items-center gap-2 mb-5" style="color: var(--text-primary);">
            <div class="h-7 w-7 rounded-lg flex items-center justify-center" style="background: var(--accent-soft);">
              <lucide-icon name="Palette" class="h-3.5 w-3.5" style="color: var(--accent);" />
            </div>
            Appearance
          </h2>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold" style="color: var(--text-primary);">Dark Mode</h3>
              <p class="text-xs mt-0.5" style="color: var(--text-muted);">Toggle between light and dark themes</p>
            </div>
            <button 
              (click)="themeService.toggleDarkMode()"
              class="w-12 h-6 rounded-full transition-all relative shrink-0"
              [style.background]="themeService.darkMode() ? 'var(--accent)' : 'var(--border-subtle)'"
            >
              <div 
                class="absolute top-0.5 left-0.5 bg-white h-5 w-5 rounded-full transition-transform shadow-sm flex items-center justify-center"
                [class.translate-x-6]="themeService.darkMode()"
              >
                <lucide-icon [name]="themeService.darkMode() ? 'Moon' : 'Sun'" class="h-2.5 w-2.5" style="color: #374151;" />
              </div>
            </button>
          </div>
        </section>

        <!-- Account -->
        <section class="rounded-2xl p-6 transition-all" style="
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-sm);
        ">
          <h2 class="text-sm font-bold flex items-center gap-2 mb-5" style="color: var(--text-primary);">
            <div class="h-7 w-7 rounded-lg flex items-center justify-center" style="background: var(--accent-soft);">
              <lucide-icon name="User" class="h-3.5 w-3.5" style="color: var(--accent);" />
            </div>
            Account
          </h2>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold" style="color: var(--text-primary);">Profile Settings</h3>
              <p class="text-xs mt-0.5" style="color: var(--text-muted);">Update your personal information</p>
            </div>
            <button 
              routerLink="/dashboard/profile"
              class="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style="background: var(--bg-base); border: 1px solid var(--border-subtle); color: var(--text-secondary);"
              (mouseenter)="$any($event.currentTarget).style.borderColor='var(--accent-border)'; $any($event.currentTarget).style.color='var(--accent)'"
              (mouseleave)="$any($event.currentTarget).style.borderColor='var(--border-subtle)'; $any($event.currentTarget).style.color='var(--text-secondary)'"
            >Manage Profile</button>
          </div>
        </section>

        <!-- Security -->
        <section class="rounded-2xl p-6 transition-all" style="
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-sm);
        ">
          <h2 class="text-sm font-bold flex items-center gap-2 mb-5" style="color: var(--text-primary);">
            <div class="h-7 w-7 rounded-lg flex items-center justify-center" style="background: var(--accent-soft);">
              <lucide-icon name="Lock" class="h-3.5 w-3.5" style="color: var(--accent);" />
            </div>
            Security
          </h2>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold" style="color: var(--text-primary);">PIN Protection</h3>
              <p class="text-xs mt-0.5" style="color: var(--text-muted);">
                {{ authService.currentUser()?.hasPin ? 'Update your security PIN' : 'Set a PIN to lock items' }}
              </p>
            </div>
            <button 
              (click)="managePin()"
              class="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style="background: var(--bg-base); border: 1px solid var(--border-subtle); color: var(--text-secondary);"
              (mouseenter)="$any($event.currentTarget).style.borderColor='var(--accent-border)'; $any($event.currentTarget).style.color='var(--accent)'"
              (mouseleave)="$any($event.currentTarget).style.borderColor='var(--border-subtle)'; $any($event.currentTarget).style.color='var(--text-secondary)'"
            >
              {{ authService.currentUser()?.hasPin ? 'Update PIN' : 'Set PIN' }}
            </button>
          </div>
        </section>


        <!-- Editor Settings -->
        <section class="rounded-2xl p-6 transition-all" style="
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-sm);
        ">
          <h2 class="text-sm font-bold flex items-center gap-2 mb-5" style="color: var(--text-primary);">
            <div class="h-7 w-7 rounded-lg flex items-center justify-center" style="background: var(--accent-soft);">
              <lucide-icon name="FileText" class="h-3.5 w-3.5" style="color: var(--accent);" />
            </div>
            Editor
          </h2>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold" style="color: var(--text-primary);">Auto-save</h3>
              <p class="text-xs mt-0.5" style="color: var(--text-muted);">Automatically save your notes as you type</p>
            </div>
            <button 
              (click)="toggleAutoSave()"
              class="w-12 h-6 rounded-full transition-all relative shrink-0"
              [style.background]="authService.currentUser()?.autoSaveEnabled ? 'var(--accent)' : 'var(--border-subtle)'"
            >
              <div 
                class="absolute top-0.5 left-0.5 bg-white h-5 w-5 rounded-full transition-transform shadow-sm"
                [class.translate-x-6]="authService.currentUser()?.autoSaveEnabled"
              ></div>
            </button>
          </div>
        </section>

        <!-- Notifications (Coming Soon) -->
        <section class="rounded-2xl p-6 transition-all" style="
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-sm);
          opacity: 0.65;
        ">
          <h2 class="text-sm font-bold flex items-center gap-2 mb-5" style="color: var(--text-primary);">
            <div class="h-7 w-7 rounded-lg flex items-center justify-center" style="background: var(--accent-soft);">
              <lucide-icon name="Bell" class="h-3.5 w-3.5" style="color: var(--accent);" />
            </div>
            Notifications
            <span class="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ml-1" style="background: var(--accent-soft); color: var(--accent);">Coming Soon</span>
          </h2>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold" style="color: var(--text-primary);">Email Notifications</h3>
              <p class="text-xs mt-0.5" style="color: var(--text-muted);">Receive updates via email</p>
            </div>
            <button class="w-12 h-6 rounded-full relative cursor-not-allowed shrink-0" style="background: var(--border-subtle);">
              <div class="absolute top-0.5 left-0.5 bg-white h-5 w-5 rounded-full shadow-sm"></div>
            </button>
          </div>
        </section>
      </div>
    </div>
  `
})
export class SettingsComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  alertService = inject(AlertService);

  async managePin() {
    const isDark = document.documentElement.classList.contains('dark');
    const { value: pin } = await Swal.fire({
      title: this.authService.currentUser()?.hasPin ? 'Update Security PIN' : 'Set Security PIN',
      input: 'password',
      inputLabel: 'Enter a 4-digit or longer PIN',
      inputPlaceholder: 'Enter PIN',
      inputAttributes: {
        maxlength: '10',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Save PIN',
      confirmButtonColor: 'var(--accent)',
      cancelButtonColor: 'var(--text-muted)',
      background: isDark ? '#171717' : '#ffffff',
      color: isDark ? '#ffffff' : '#171717',
      customClass: {
        popup: 'rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl',
        input: 'rounded-xl border border-neutral-200 dark:border-neutral-800'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter a PIN!';
        }
        if (value.length < 4) {
          return 'PIN must be at least 4 digits!';
        }
        return null;
      }
    });

    if (pin) {
      this.authService.setPin(pin).subscribe({
        next: () => {
          this.alertService.success('Success', 'PIN has been successfully updated.');
        },
        error: (err) => {
          this.alertService.error('Error', err.error?.message || 'Failed to update PIN.');
        }
      });
    }
  }

  toggleAutoSave() {
    const currentState = !!this.authService.currentUser()?.autoSaveEnabled;
    this.authService.setAutoSave(!currentState).subscribe({
      next: (res) => {
        this.alertService.success('Settings Updated', `Auto-save is now ${res.autoSaveEnabled ? 'enabled' : 'disabled'}.`);
      },
      error: (err) => {
        this.alertService.error('Error', err.error?.message || 'Failed to update auto-save setting.');
      }
    });
  }
}
