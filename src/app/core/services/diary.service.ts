import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Diary } from '../interfaces';
import { tap } from 'rxjs/operators';
import { DiaryEntryService } from './diary-entry.service';

@Injectable({
  providedIn: 'root'
})
export class DiaryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/diaries`;
  private diaryEntryService = inject(DiaryEntryService);

  diaries = signal<Diary[]>([]);
  activeDiary = signal<Diary | null>(null);

  fetchDiaries() {
    return this.http.get<Diary[]>(this.apiUrl).pipe(
      tap(data => this.diaries.set(data))
    );
  }

  getDiary(id: string) {
    return this.http.get<Diary>(`${this.apiUrl}/${id}`).pipe(
      tap(data => {
        this.activeDiary.set(data);
        // On viewing a Diary, fetch its entries, and automatically select the most recent entry for display
        this.diaryEntryService.fetchEntriesForDiary(id).subscribe();
      })
    );
  }

  createDiary(diaryData: { name: string; description?: string }) {
    return this.http.post<Diary>(this.apiUrl, diaryData).pipe(
      tap(newDiary => {
        this.diaries.update(current => [...current, newDiary]);
      })
    );
  }

  updateDiary(id: string, updates: { name?: string; description?: string }) {
    return this.http.patch<Diary>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updatedDiary => {
        this.diaries.update(current => 
          current.map(d => d.id === id ? updatedDiary : d)
        );
        if (this.activeDiary()?.id === id) {
          this.activeDiary.set(updatedDiary);
        }
      })
    );
  }

  deleteDiary(id: string) {
    // Optimistic delete
    const previousDiaries = this.diaries();
    this.diaries.update(current => current.filter(d => d.id !== id));
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap({
        error: () => {
          // Revert on error
          this.diaries.set(previousDiaries);
        }
      })
    );
  }
}
