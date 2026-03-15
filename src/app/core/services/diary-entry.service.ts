import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DiaryEntry } from '../interfaces';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiaryEntryService {
  private http = inject(HttpClient);
  
  entries = signal<DiaryEntry[]>([]);
  activeEntry = signal<DiaryEntry | null>(null);

  fetchEntriesForDiary(diaryId: string) {
    if (!diaryId) return of([]);
    return this.http.get<DiaryEntry[]>(`${environment.apiUrl}/diaries/${diaryId}/entries`).pipe(
      tap(data => {
        // already ordered by date descending by backend according to specs
        this.entries.set(data);
        if (data && data.length > 0) {
          // automatically select the most recent entry for display
          this.activeEntry.set(data[0]);
        } else {
          this.activeEntry.set(null);
        }
      })
    );
  }

  getEntry(id: string) {
    return this.http.get<DiaryEntry>(`${environment.apiUrl}/diary-entries/${id}`).pipe(
      tap(data => this.activeEntry.set(data))
    );
  }

  createEntry(diaryId: string, entryData: { date: string; title?: string; content: any }) {
    return this.http.post<DiaryEntry>(`${environment.apiUrl}/diaries/${diaryId}/entries`, entryData).pipe(
      tap(newEntry => {
        // Assuming we want to maintain sorting by date descending here
        this.entries.update(current => {
          const newEntries = [newEntry, ...current];
          return newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        this.activeEntry.set(newEntry);
      })
    );
  }

  updateEntry(id: string, updates: { date?: string; title?: string; content?: any }) {
    return this.http.patch<DiaryEntry>(`${environment.apiUrl}/diary-entries/${id}`, updates).pipe(
      tap(updatedEntry => {
        this.entries.update(current => {
          const newEntries = current.map(e => e.id === id ? updatedEntry : e);
          if (updates.date) {
            newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          }
          return newEntries;
        });
        if (this.activeEntry()?.id === id) {
          this.activeEntry.set(updatedEntry);
        }
      })
    );
  }

  deleteEntry(id: string) {
    const previousEntries = this.entries();
    this.entries.update(current => current.filter(e => e.id !== id));
    
    if (this.activeEntry()?.id === id) {
       const remaining = this.entries();
       this.activeEntry.set(remaining.length > 0 ? remaining[0] : null);
    }

    return this.http.delete<void>(`${environment.apiUrl}/diary-entries/${id}`).pipe(
      tap({
        error: () => {
          this.entries.set(previousEntries);
        }
      })
    );
  }
}
