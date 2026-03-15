import { Injectable, signal, inject } from '@angular/core';
import { Note } from '../interfaces';
import { BaseApiService } from './base-api.service';
import { WorkspaceService } from './workspace.service';
import { tap, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteService extends BaseApiService {
  private workspaceService = inject(WorkspaceService);
  
  notes = signal<Note[]>([]);
  activeNote = signal<Note | null>(null);

  getNotesForNotebook(notebookId: string) {
    return this.get<Note[]>(`notebooks/${notebookId}/notes`).pipe(
      tap(notes => this.notes.set(notes))
    );
  }

  getNoteById(id: string) {
    return this.get<Note>(`notes/${id}`).pipe(
      tap(note => this.activeNote.set(note))
    );
  }

  createNote(notebookId: string, workspaceId: string, data: Partial<Note>) {
    return this.post<Note>(`notebooks/${notebookId}/notes`, data).pipe(
      tap(newNote => {
        this.notes.update(prev => [...prev, newNote]);
        this.updateNoteInTree(workspaceId, notebookId, newNote.id, newNote);
      })
    );
  }

  updateNote(id: string, notebookId: string, workspaceId: string, data: Partial<Note>) {
    return this.patch<Note>(`notes/${id}`, data).pipe(
      tap(updated => {
        const fullUpdate = { ...updated, ...data };
        this.notes.update(prev => prev.map(n => n.id === id ? { ...n, ...fullUpdate } : n));
        this.updateNoteInTree(workspaceId, notebookId, id, fullUpdate);
        if (this.activeNote()?.id === id) {
          this.activeNote.set({ ...this.activeNote()!, ...fullUpdate });
        }
      })
    );
  }

  deleteNote(id: string, notebookId: string, workspaceId: string) {
    // Optimistic UI
    const previousNotes = this.notes();
    this.notes.update(prev => prev.filter(n => n.id !== id));
    this.updateNoteInTree(workspaceId, notebookId, id, null);

    return this.delete(`notes/${id}`).pipe(
      catchError(err => {
        this.notes.set(previousNotes);
        this.workspaceService.getWorkspaces().subscribe();
        throw err;
      }),
      tap(() => {
        if (this.activeNote()?.id === id) {
          this.activeNote.set(null);
        }
      })
    );
  }

  private updateNoteInTree(workspaceId: string, notebookId: string, noteId: string, data: Partial<Note> | null) {
    let wsId = workspaceId;
    
    // If workspaceId not provided, try to find it in the tree
    if (!wsId) {
      for (const ws of this.workspaceService.workspaces()) {
        if ((ws.notebooks || []).some(nb => nb.id === notebookId)) {
          wsId = ws.id;
          break;
        }
      }
    }

    if (!wsId) return;

    this.workspaceService.workspaces.update(prev => prev.map(w => {
      if (w.id !== wsId) return w;
      return {
        ...w,
        notebooks: (w.notebooks || []).map(nb => {
          if (nb.id !== notebookId) return nb;
          const notes = nb.notes || [];
          if (data === null) {
            return { ...nb, notes: notes.filter(n => n.id !== noteId) };
          }
          const exists = notes.some(n => n.id === noteId);
          if (exists) {
            return { ...nb, notes: notes.map(n => n.id === noteId ? { ...n, ...data } : n) };
          }
          return { ...nb, notes: [...notes, data as Note] };
        })
      };
    }));
  }
}
