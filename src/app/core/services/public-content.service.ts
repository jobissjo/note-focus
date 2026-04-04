import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Diary, Note, Story } from '../interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicContentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/public`;

  getPublicJournals(): Observable<Diary[]> {
    return this.http.get<Diary[]>(`${this.base}/journals`);
  }

  getPublicJournal(id: string): Observable<Diary> {
    return this.http.get<Diary>(`${this.base}/journals/${id}`);
  }

  getPublicNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.base}/notes`);
  }

  getPublicNote(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.base}/notes/${id}`);
  }

  getPublicStories(): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.base}/stories`);
  }

  getPublicStory(id: string): Observable<Story> {
    return this.http.get<Story>(`${this.base}/stories/${id}`);
  }
}
