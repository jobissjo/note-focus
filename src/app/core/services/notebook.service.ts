import { Injectable, signal } from '@angular/core';
import { Notebook } from '../interfaces';
import { BaseApiService } from './base-api.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotebookService extends BaseApiService {
  notebooks = signal<Notebook[]>([]);
  activeNotebook = signal<Notebook | null>(null);

  getNotebooksForWorkspace(workspaceId: string) {
    return this.get<Notebook[]>(`workspaces/${workspaceId}/notebooks`).pipe(
      tap(notebooks => this.notebooks.set(notebooks))
    );
  }

  createNotebook(workspaceId: string, data: Partial<Notebook>) {
    return this.post<Notebook>(`workspaces/${workspaceId}/notebooks`, data).pipe(
      tap(newNotebook => {
        this.notebooks.update(prev => [...prev, newNotebook]);
      })
    );
  }

  updateNotebook(id: string, data: Partial<Notebook>) {
    return this.patch<Notebook>(`notebooks/${id}`, data).pipe(
      tap(updated => {
        this.notebooks.update(prev => prev.map(n => n.id === id ? updated : n));
        if (this.activeNotebook()?.id === id) {
          this.activeNotebook.set(updated);
        }
      })
    );
  }

  deleteNotebook(id: string) {
    return this.delete(`notebooks/${id}`).pipe(
      tap(() => {
        this.notebooks.update(prev => prev.filter(n => n.id !== id));
      })
    );
  }
}
