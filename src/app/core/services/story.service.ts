import { Injectable, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Story } from '../interfaces';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StoryService extends BaseApiService {
  stories = signal<Story[]>([]);
  activeStory = signal<Story | null>(null);

  getStories(pin?: string, hidden?: boolean) {
    const params: any = {};
    if (pin) params.pin = pin;
    if (hidden) params.hidden = hidden;

    return this.get<Story[]>('stories', params).pipe(
      tap((stories) => this.stories.set(stories))
    );
  }

  getStoryById(id: string) {
    return this.get<Story>(`stories/${id}`).pipe(
      tap((story) => this.activeStory.set(story))
    );
  }

  createStory(storyData: { title: string; content: any; isLocked?: boolean; isHidden?: boolean }) {
    return this.post<Story>('stories', storyData).pipe(
      tap((newStory) => {
        this.stories.update((prev) => [newStory, ...prev]);
        this.activeStory.set(newStory);
      })
    );
  }

  updateStory(id: string, data: Partial<Story>) {
    return this.patch<Story>(`stories/${id}`, data).pipe(
      tap((updatedStory) => {
        this.stories.update((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updatedStory } : s))
        );
        if (this.activeStory()?.id === id) {
          this.activeStory.set({ ...this.activeStory()!, ...updatedStory });
        }
      })
    );
  }

  deleteStory(id: string) {
    return this.delete(`stories/${id}`).pipe(
      tap(() => {
        this.stories.update((prev) => prev.filter((s) => s.id !== id));
        if (this.activeStory()?.id === id) {
          this.activeStory.set(null);
        }
      })
    );
  }
}
