import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { LucideAngularModule, Plus, LayoutGrid, List } from 'lucide-angular';

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-8 max-w-6xl mx-auto">
      <header class="flex items-center justify-between mb-12">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Workspaces</h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-1">Select or create a workspace to get started</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
          <lucide-icon [name]="'Plus'" class="h-5 w-5" />
          <span>New Workspace</span>
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (workspace of workspaceService.workspaces(); track workspace.id) {
          <div class="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:shadow-2xl hover:border-indigo-500/50 transition-all cursor-pointer">
            <div class="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              {{ workspace.emoji || '📂' }}
            </div>
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-indigo-500 transition-colors">{{ workspace.name }}</h3>
            <p class="text-neutral-500 text-sm mt-1 line-clamp-2">{{ workspace.description || 'No description provided.' }}</p>
            
            <div class="mt-6 flex items-center gap-4 text-xs text-neutral-400">
              <span class="flex items-center gap-1">
                <lucide-icon [name]="'LayoutGrid'" class="h-3 w-3" />
                {{ (workspace.notebooks || []).length }} Notebooks
              </span>
            </div>
          </div>
        }

        <!-- Add Placeholder if empty -->
        @if (workspaceService.workspaces().length === 0) {
           <div class="col-span-full py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
             <div class="h-16 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide-icon [name]="'Plus'" class="h-8 w-8 text-neutral-400" />
             </div>
             <h3 class="text-xl font-bold">No workspaces found</h3>
             <p class="text-neutral-500 mt-2">Create your first workspace to start organizing your notes</p>
           </div>
        }
      </div>
    </div>
  `
})
export class WorkspaceListComponent implements OnInit {
  workspaceService = inject(WorkspaceService);

  readonly Plus = Plus;
  readonly LayoutGrid = LayoutGrid;
  readonly List = List;

  ngOnInit() {
    this.workspaceService.getWorkspaces().subscribe();
  }
}
