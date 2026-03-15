import { Injectable, signal, inject } from '@angular/core';
import { Note, Notebook } from '../interfaces';
import { BaseApiService } from './base-api.service';
import { catchError, tap } from 'rxjs';
import { WorkspaceService } from './workspace.service';

@Injectable({
  providedIn: 'root',
})
export class NotebookService extends BaseApiService {
  private workspaceService = inject(WorkspaceService);
  
  notebooks = signal<Notebook[]>([]);
  activeNotebook = signal<Notebook | null>(null);

  getNotebooksForWorkspace(workspaceId: string) {
    return this.get<Notebook[]>(`workspaces/${workspaceId}/notebooks`).pipe(
      tap(notebooks => {
        this.notebooks.set(notebooks);
        // Sync with workspace tree
        notebooks.forEach(nb => this.workspaceService.updateNotebookInTree(workspaceId, nb.id, nb));
      })
    );
  }

  getNotebookById(id: string) {
    return this.get<Notebook>(`notebooks/${id}`).pipe(
      tap(notebook => this.activeNotebook.set(notebook))
    );
  }

  fetchNotesForNotebook(workspaceId: string, notebookId: string) {
    return this.get<Note[]>(`notebooks/${notebookId}/notes`).pipe(
      tap(notes => {
        this.workspaceService.workspaces.update(prev => prev.map(w => {
          if (w.id !== workspaceId) return w;
          return {
            ...w,
            notebooks: (w.notebooks || []).map(nb => nb.id === notebookId ? { ...nb, notes } : nb)
          };
        }));
      })
    );
  }

  createNotebook(workspaceId: string, data: Partial<Notebook>) {
    return this.post<Notebook>(`workspaces/${workspaceId}/notebooks`, data).pipe(
      tap(newNotebook => {
        this.notebooks.update(prev => [...prev, newNotebook]);
        this.workspaceService.updateNotebookInTree(workspaceId, newNotebook.id, newNotebook);
      })
    );
  }

  updateNotebook(id: string, workspaceId: string, data: Partial<Notebook>) {
    return this.patch<Notebook>(`notebooks/${id}`, data).pipe(
      tap(updated => {
        this.notebooks.update(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n));
        this.workspaceService.updateNotebookInTree(workspaceId, id, updated);
        if (this.activeNotebook()?.id === id) {
          this.activeNotebook.set({ ...this.activeNotebook()!, ...updated });
        }
      })
    );
  }

  deleteNotebook(id: string, workspaceId: string) {
    // Optimistic UI
    const previousNotebooks = this.notebooks();
    this.notebooks.update(prev => prev.filter(n => n.id !== id));
    this.workspaceService.updateNotebookInTree(workspaceId, id, null);

    return this.delete(`notebooks/${id}`).pipe(
      catchError(err => {
        // Rollback
        this.notebooks.set(previousNotebooks);
        // To truly rollback the workspace tree we might need more state, 
        // but for now let's hope it works or re-fetch.
        this.workspaceService.getWorkspaces().subscribe();
        throw err;
      }),
      tap(() => {
        if (this.activeNotebook()?.id === id) {
          this.activeNotebook.set(null);
        }
      })
    );
  }
}
