import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Sparkles, BookOpen, LayoutGrid, Plus, Clock, FileText, ChevronRight, TrendingUp, Zap, Star } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardRecentItem } from '../../../core/interfaces';

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
}
