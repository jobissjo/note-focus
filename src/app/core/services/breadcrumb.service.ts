import { inject, Injectable, signal } from '@angular/core';
import { WorkspaceService } from './workspace.service';
import { NoteService } from './note.service';
import { computed } from '@angular/core';

export interface Breadcrumb {
  label: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private workspaceService = inject(WorkspaceService);
  private noteService = inject(NoteService);

  breadcrumbs = computed(() => {
    const crumbs: Breadcrumb[] = [];
    const activeNote = this.noteService.activeNote();
    const workspaces = this.workspaceService.workspaces();

    if (activeNote) {
      // Find workspace and notebook in the tree
      for (const ws of workspaces) {
        const nb = (ws.notebooks || []).find(n => n.id === activeNote.notebookId);
        if (nb) {
          crumbs.push({ label: ws.name, url: '/dashboard' });
          crumbs.push({ label: nb.name });
          crumbs.push({ label: activeNote.title });
          break;
        }
      }
    } else {
       crumbs.push({ label: 'Workspaces', url: '/dashboard' });
    }

    return crumbs;
  });
}
