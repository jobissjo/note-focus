import { Injectable, signal } from '@angular/core';
import { Workspace } from '../interfaces';
import { BaseApiService } from './base-api.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService extends BaseApiService {
  // Signals
  workspaces = signal<Workspace[]>([]);
  activeWorkspace = signal<Workspace | null>(null);

  getWorkspaces() {
    return this.get<Workspace[]>('workspaces').pipe(
      tap(workspaces => this.workspaces.set(workspaces))
    );
  }

  getWorkspaceById(id: string) {
    return this.get<Workspace>(`workspaces/${id}`).pipe(
      tap(workspace => this.activeWorkspace.set(workspace))
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
        this.workspaces.update(prev => prev.map(w => w.id === id ? updated : w));
        if (this.activeWorkspace()?.id === id) {
          this.activeWorkspace.set(updated);
        }
      })
    );
  }

  deleteWorkspace(id: string) {
    return this.delete(`workspaces/${id}`).pipe(
      tap(() => {
        this.workspaces.update(prev => prev.filter(w => w.id !== id));
        if (this.activeWorkspace()?.id === id) {
          this.activeWorkspace.set(null);
        }
      })
    );
  }
}
