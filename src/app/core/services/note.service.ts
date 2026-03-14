import { Injectable, signal } from '@angular/core';
import { Note } from '../interfaces';
import { BaseApiService } from './base-api.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteService extends BaseApiService {
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

  createNote(notebookId: string, data: Partial<Note>) {
    return this.post<Note>(`notebooks/${notebookId}/notes`, data).pipe(
      tap(newNote => {
        this.notes.update(prev => [...prev, newNote]);
      })
    );
  }

  updateNote(id: string, data: Partial<Note>) {
    return this.patch<Note>(`notes/${id}`, data).pipe(
      tap(updated => {
        this.notes.update(prev => prev.map(n => n.id === id ? updated : n));
        if (this.activeNote()?.id === id) {
          this.activeNote.set(updated);
        }
      })
    );
  }

  deleteNote(id: string) {
    return this.delete(`notes/${id}`).pipe(
      tap(() => {
        this.notes.update(prev => prev.filter(n => n.id !== id));
      })
    );
  }
}
