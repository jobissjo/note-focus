import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Sparkles, BookOpen, LayoutGrid, Plus, Clock, FileText, ChevronRight, TrendingUp, Zap, Star } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardRecentItem } from '../../../core/interfaces';
import { Router } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  authService = inject(AuthService);
  dashboardService = inject(DashboardService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  isLoading = signal(true);

  // Stats from service summary signal
  stats = computed(() => this.dashboardService.summary()?.stats || { workspaces: 0, journals: 0, stories: 0 });
  
  // Recent items from service summary signal
  recentItems = computed(() => this.dashboardService.summary()?.recentActivity || []);

  readonly Sparkles = Sparkles;
  readonly BookOpen = BookOpen;
  readonly LayoutGrid = LayoutGrid;
  readonly Plus = Plus;
  readonly Clock = Clock;
  readonly FileText = FileText;
  readonly ChevronRight = ChevronRight;
  readonly TrendingUp = TrendingUp;
  readonly Zap = Zap;
  readonly Star = Star;

  ngOnInit() {
    this.authService.checkSession();
    this.isLoading.set(true);
    this.dashboardService.getDashboardSummary().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  getTypeStyles(type: string): { color: string; icon: string; link: string[] } {
    switch (type) {
      case 'note': return { color: '#7C5CFF', icon: 'FileText', link: ['/dashboard/notes'] };
      case 'journal': return { color: '#f59e0b', icon: 'BookOpen', link: ['/dashboard/diaries'] };
      case 'story': return { color: '#22c55e', icon: 'Sparkles', link: ['/dashboard/stories'] };
      default: return { color: 'var(--text-muted)', icon: 'Clock', link: ['/dashboard'] };
    }
  }

  getItemLink(item: DashboardRecentItem): string[] {
    const { link } = this.getTypeStyles(item.type);
    return [...link, item.id];
  }

  async onRecentItemClick(item: any) {
    if (item.isLocked) {
      const isDark = document.documentElement.classList.contains('dark');
      const { value: pin } = await Swal.fire({
        title: this.getLockedTitle(item.type),
        text: 'Please enter your security PIN to access this item.',
        input: 'password',
        inputPlaceholder: 'Enter PIN',
        inputAttributes: {
          maxlength: '10',
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Unlock',
        confirmButtonColor: 'var(--accent)',
        background: isDark ? '#171717' : '#ffffff',
        color: isDark ? '#ffffff' : '#171717',
        customClass: {
          popup: 'rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl',
          input: 'rounded-xl border border-neutral-200 dark:border-neutral-800'
        }
      });

      if (pin) {
        this.authService.verifyPin(pin).subscribe({
          next: () => {
            this.router.navigate(this.getItemLink(item));
          },
          error: (err) => {
            this.alertService.error('Invalid PIN', err.error?.message || 'Access denied.');
          }
        });
      }
    } else {
      this.router.navigate(this.getItemLink(item));
    }
  }

  private getLockedTitle(type: string): string {
    switch (type) {
      case 'note': return 'Note Locked';
      case 'journal': return 'Journal Locked';
      case 'story': return 'Story Locked';
      default: return 'Locked';
    }
  }
}
