import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LucideAngularModule, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, LucideAngularModule],
  template: `
    <div class="flex h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans">
      <!-- Mobile Overlay -->
      @if (isMobileMenuOpen()) {
        <div 
          (click)="isMobileMenuOpen.set(false)"
          class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        ></div>
      }

      <!-- Sidebar -->
      <div 
        class="fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out"
        [class.-translate-x-full]="!isMobileMenuOpen()"
      >
        <app-sidebar class="h-full" />
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 relative">
        <!-- Mobile Header -->
        <header class="lg:hidden h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 shrink-0 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl">
          <button 
            (click)="isMobileMenuOpen.set(true)"
            class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <lucide-icon [name]="'Menu'" class="h-5 w-5" />
          </button>
          <div class="ml-4 font-bold tracking-tight">NoteFocus</div>
        </header>

        <main class="flex-1 relative overflow-y-auto custom-scrollbar">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class DashboardShellComponent {
  isMobileMenuOpen = signal(false);

  readonly Menu = Menu;
  readonly X = X;
}
