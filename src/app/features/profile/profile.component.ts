import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-full px-8 py-10 max-w-4xl mx-auto" style="font-family: var(--font-sans);">
      <!-- Page Header -->
      <header class="mb-10">
        <div class="flex items-center gap-2.5 mb-2">
          <div class="h-9 w-9 rounded-xl flex items-center justify-center" style="background: var(--accent-soft);">
            <lucide-icon name="User" class="h-5 w-5" style="color: var(--accent);" />
          </div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary);">Profile</h1>
        </div>
        <p class="text-sm" style="color: var(--text-muted);">Manage your account information and preferences.</p>
      </header>

      <!-- Profile Card -->
      <div class="rounded-2xl overflow-hidden mb-5" style="
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-sm);
      ">
        <!-- Avatar + Name Header -->
        <div class="px-8 py-6 flex items-center gap-5" style="border-bottom: 1px solid var(--border-subtle);">
          <div class="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style="background: linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%); box-shadow: 0 4px 16px var(--accent-glow);"
          >
            {{ userInitials() }}
          </div>
          <div>
            <h2 class="text-lg font-bold" style="color: var(--text-primary);">{{ user()?.name || 'User' }}</h2>
            <p class="text-sm" style="color: var(--text-muted);">{{ user()?.email }}</p>
          </div>
        </div>

        <!-- Info Fields -->
        <div class="px-8 py-6">
          <p class="text-xs font-semibold uppercase tracking-wider mb-5" style="color: var(--text-muted);">Personal Information</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium block mb-1.5" style="color: var(--text-muted);">Full Name</label>
              <div class="flex items-center gap-3 rounded-xl py-3 px-4" style="background: var(--bg-base); border: 1px solid var(--border-subtle);">
                <lucide-icon name="User" class="h-4 w-4 shrink-0" style="color: var(--text-muted);" />
                <span class="text-sm font-medium" style="color: var(--text-primary);">{{ user()?.name || 'User' }}</span>
              </div>
            </div>
            <div>
              <label class="text-xs font-medium block mb-1.5" style="color: var(--text-muted);">Email Address</label>
              <div class="flex items-center gap-3 rounded-xl py-3 px-4" style="background: var(--bg-base); border: 1px solid var(--border-subtle);">
                <lucide-icon name="Mail" class="h-4 w-4 shrink-0" style="color: var(--text-muted);" />
                <span class="text-sm font-medium" style="color: var(--text-primary);">{{ user()?.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="rounded-2xl p-6" style="
        background: rgba(239,68,68,0.04);
        border: 1px solid rgba(239,68,68,0.15);
      ">
        <h3 class="text-sm font-bold flex items-center gap-2 mb-4" style="color: #ef4444;">
          <lucide-icon name="AlertTriangle" class="h-4 w-4" />
          Danger Zone
        </h3>
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-semibold" style="color: #ef4444;">Delete Account</h4>
            <p class="text-xs mt-0.5" style="color: rgba(239,68,68,0.7);">Permanently remove your account and all data</p>
          </div>
          <button class="px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors opacity-50 cursor-not-allowed"
            style="background: #ef4444;"
          >Delete Account</button>
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
