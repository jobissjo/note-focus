import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronRight, ChevronDown, Plus, Hash, Notebook as NotebookIcon, StickyNote, Settings, LogOut, Search, Command } from 'lucide-angular';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <aside 
      class="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl flex flex-col transition-all duration-300"
      [class.w-16]="isCollapsed()"
    >
      <!-- Header / User Profile -->
      <div class="p-4 flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800">
        <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <span class="font-bold text-sm">N</span>
        </div>
        @if (!isCollapsed()) {
          <div class="flex-1 min-w-0">
            <h1 class="text-sm font-semibold truncate leading-none">NoteFocus</h1>
            <p class="text-[10px] text-neutral-500 mt-1 truncate">{{ authService.currentUser()?.email }}</p>
          </div>
        }
      </div>

      <!-- Search Area -->
      @if (!isCollapsed()) {
        <div class="px-3 py-4">
          <div class="relative group">
            <lucide-icon [name]="'Search'" class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Quick search..." 
              class="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-md py-1.5 pl-9 pr-8 text-xs focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-neutral-500"
            />
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1 rounded bg-neutral-200 dark:bg-neutral-700 text-[10px] text-neutral-500">
              <lucide-icon [name]="'Command'" class="h-2 w-2" />
              <span>K</span>
            </div>
          </div>
        </div>
      }

      <!-- Hierarchy Tree -->
      <nav class="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
        @for (workspace of workspaceService.workspaces(); track workspace.id) {
          <div class="mb-4">
            <div 
              (click)="toggleWorkspace(workspace.id)"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer group transition-colors"
            >
              <lucide-icon [name]="expandedWorkspaces().has(workspace.id) ? 'ChevronDown' : 'ChevronRight'" class="h-3.5 w-3.5 text-neutral-400" />
              <span class="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{{ workspace.name }}</span>
              <button class="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all">
                <lucide-icon [name]="'Plus'" class="h-3 w-3" />
              </button>
            </div>

            @if (expandedWorkspaces().has(workspace.id)) {
              <div class="ml-2 mt-1 space-y-0.5 border-l border-neutral-200 dark:border-neutral-800 ml-3.5 pl-2">
                @for (notebook of workspace.notebooks; track notebook.id) {
                  <div>
                    <div 
                      (click)="toggleNotebook(notebook.id)"
                      class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer group transition-colors"
                    >
                      <lucide-icon [name]="'Notebook'" class="h-4 w-4 text-indigo-500" />
                      <span class="text-xs font-medium">{{ notebook.name }}</span>
                    </div>

                    @if (expandedNotebooks().has(notebook.id)) {
                      <div class="ml-4 mt-1 space-y-0.5">
                        @for (note of notebook.notes; track note.id) {
                          <a 
                            [routerLink]="['/notes', note.id]"
                            routerLinkActive="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                            class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer group transition-colors"
                          >
                            <lucide-icon [name]="'StickyNote'" class="h-3.5 w-3.5 text-neutral-400 group-hover:text-indigo-500" />
                            <span class="text-xs truncate">{{ note.title }}</span>
                          </a>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </nav>

      <!-- Bottom Actions -->
      <div class="p-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
        <button class="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs text-neutral-600 dark:text-neutral-400">
          <lucide-icon [name]="'Settings'" class="h-4 w-4" />
          @if (!isCollapsed()) { <span>Settings</span> }
        </button>
        <button (click)="authService.logout()" class="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs text-red-600 dark:text-red-400">
          <lucide-icon [name]="'LogOut'" class="h-4 w-4" />
          @if (!isCollapsed()) { <span>Logout</span> }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.1);
      border-radius: 10px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
    }
  `]
})
export class SidebarComponent {
  workspaceService = inject(WorkspaceService);
  authService = inject(AuthService);

  isCollapsed = signal(false);
  expandedWorkspaces = signal<Set<string>>(new Set());
  expandedNotebooks = signal<Set<string>>(new Set());

  readonly ChevronRight = ChevronRight;
  readonly ChevronDown = ChevronDown;
  readonly Plus = Plus;
  readonly Hash = Hash;
  readonly NotebookIcon = NotebookIcon;
  readonly StickyNote = StickyNote;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly Search = Search;
  readonly Command = Command;

  toggleWorkspace(id: string) {
    this.expandedWorkspaces.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  toggleNotebook(id: string) {
    this.expandedNotebooks.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
}
