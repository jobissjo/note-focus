import { Component, inject, OnDestroy, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StoryService } from '../../../core/services/story.service';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, Clock, Trash2, Maximize2, Share2, Loader2, ChevronLeft, Sparkles } from 'lucide-angular';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-story-editor',
  standalone: true,
  imports: [CommonModule, NgxEditorModule, FormsModule, LucideAngularModule, RouterModule],
  templateUrl: './story-editor.component.html',
  styleUrls: ['./story-editor.component.css']
})
export class StoryEditorComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  storyService = inject(StoryService);
  private alertService = inject(AlertService);
  authService = inject(AuthService);
  isBrowser = isPlatformBrowser(this.platformId);

  private destroy$ = new Subject<void>();
  private saveSubject = new Subject<{ title?: string; content?: any }>();
  isSaving = signal(false);

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  content = signal<any>(null);

  readonly Save = Save;
  readonly Clock = Clock;
  readonly Trash2 = Trash2;
  readonly Maximize2 = Maximize2;
  readonly Share2 = Share2;
  readonly Loader2 = Loader2;
  readonly ChevronLeft = ChevronLeft;
  readonly Sparkles = Sparkles;

  ngOnInit(): void {
    if (this.isBrowser) {
      this.editor = new Editor();

      this.saveSubject.pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      ).subscribe(data => {
        this.saveStory(data);
      });
    }

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.storyService.getStoryById(id).subscribe(story => {
          this.content.set(story.content);
        });
      }
    });
  }

  private saveStory(data: { title?: string; content?: any }) {
    const story = this.storyService.activeStory();
    if (!story) return;

    this.isSaving.set(true);
    this.storyService.updateStory(story.id, data).subscribe({
      next: () => this.isSaving.set(false),
      error: () => this.isSaving.set(false)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.editor) {
      this.editor.destroy();
    }
  }

  onContentChange(newContent: any) {
    this.content.set(newContent);
    if (this.authService.currentUser()?.autoSaveEnabled) {
      this.saveSubject.next({ content: newContent });
    }
  }

  updateTitle(newTitle: string) {
    if (this.authService.currentUser()?.autoSaveEnabled) {
      this.saveSubject.next({ title: newTitle });
    }
  }

  manualSave() {
    const story = this.storyService.activeStory();
    if (!story) return;
    this.saveStory({ title: (document.querySelector('input[placeholder="Untitled Story"]') as HTMLInputElement)?.value, content: this.content() });
  }

  async onDeleteStory() {
    const story = this.storyService.activeStory();
    if (!story) return;

    const confirmed = await this.alertService.confirm(
      'Delete Story',
      `Are you sure you want to delete "${story.title || 'this story'}"?`
    );

    if (confirmed) {
      this.storyService.deleteStory(story.id).subscribe(() => {
        this.router.navigate(['/dashboard/stories']);
      });
    }
  }
}
