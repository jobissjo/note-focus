import { Injectable, signal } from '@angular/core';
import { Notebook, Workspace } from '../interfaces';
import { BaseApiService } from './base-api.service';
import { catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService extends BaseApiService {
  // Signals
  workspaces = signal<Workspace[]>([]);
  activeWorkspace = signal<Workspace | null>(null);

  getWorkspaces(pin?: string, hidden?: boolean) {
    const params: any = {};
    if (pin) params.pin = pin;
    if (hidden) params.hidden = hidden;
    
    return this.get<Workspace[]>('workspaces', params).pipe(
      tap(workspaces => this.workspaces.set(workspaces))
    );
  }

  getWorkspaceById(id: string) {
    return this.get<Workspace>(`workspaces/${id}`).pipe(
      tap(workspace => {
        this.activeWorkspace.set(workspace);
        // If workspace loaded, maybe fetch notebooks too
      })
    );
  }

  fetchNotebooksForWorkspace(workspaceId: string) {
    return this.get<Notebook[]>(`workspaces/${workspaceId}/notebooks`).pipe(
      tap(notebooks => {
        this.workspaces.update(prev => 
          prev.map(w => w.id === workspaceId ? { ...w, notebooks } : w)
        );
      })
    );
  }

  createWorkspace(data: Partial<Workspace>) {
    return this.post<Workspace>('workspaces', data).pipe(
      tap(newWorkspace => {
        this.workspaces.update(prev => [...prev, newWorkspace]);
      })
    );
  }

  updateWorkspace(id: string, data: Partial<Workspace>) {
    return this.patch<Workspace>(`workspaces/${id}`, data).pipe(
      tap(updated => {
        this.workspaces.update(prev => prev.map(w => w.id === id ? { ...w, ...updated } : w));
        if (this.activeWorkspace()?.id === id) {
          this.activeWorkspace.set({ ...this.activeWorkspace()!, ...updated });
        }
      })
    );
  }

  deleteWorkspace(id: string) {
    // Optimistic UI
    const previousWorkspaces = this.workspaces();
    this.workspaces.update(prev => prev.filter(w => w.id !== id));
    
    return this.delete(`workspaces/${id}`).pipe(
      catchError(err => {
        // Rollback on error
        this.workspaces.set(previousWorkspaces);
        throw err;
      }),
      tap(() => {
        if (this.activeWorkspace()?.id === id) {
          this.activeWorkspace.set(null);
        }
      })
    );
  }

  // Update notebook in workspace tree (for optimistic UI from notebook service)
  updateNotebookInTree(workspaceId: string, notebookId: string, data: Partial<Notebook> | null) {
    this.workspaces.update(prev => prev.map(w => {
      if (w.id !== workspaceId) return w;
      const notebooks = w.notebooks || [];
      if (data === null) { // Delete
        return { ...w, notebooks: notebooks.filter(nb => nb.id !== notebookId) };
      }
      // Update or Add
      const exists = notebooks.some(nb => nb.id === notebookId);
      if (exists) {
        return { ...w, notebooks: notebooks.map(nb => nb.id === notebookId ? { ...nb, ...data } : nb) };
      }
      return { ...w, notebooks: [...notebooks, data as Notebook] };
    }));
  }
}
