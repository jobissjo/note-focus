import { Component, inject, OnDestroy, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { NoteService } from '../../../core/services/note.service';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, Clock, Trash2, Maximize2, Share2, Loader2, ChevronRight } from 'lucide-angular';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, NgxEditorModule, FormsModule, LucideAngularModule, RouterModule],
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css']
})
export class NoteEditorComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  noteService = inject(NoteService);
  breadcrumbService = inject(BreadcrumbService);
  private alertService = inject(AlertService);
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

  ngOnInit(): void {
    if (this.isBrowser) {
      this.editor = new Editor();

      this.saveSubject.pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      ).subscribe(data => {
        this.saveNote(data);
      });
    }

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.noteService.getNoteById(id).subscribe(note => {
          this.content.set(note.content);
        });
      }
    });
  }

  private saveNote(data: { title?: string; content?: any }) {
    const note = this.noteService.activeNote();
    if (!note) return;

    this.isSaving.set(true);
    // Try to find notebook/workspace IDs from current state if available, 
    // though the service could also find them if we pass them.
    // For now, let's assume the service can handle it or we pass what we have.
    this.noteService.updateNote(note.id, note.notebookId, '', data).subscribe({ // workspaceId empty for now if not easily found
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
    this.saveSubject.next({ content: newContent });
  }

  updateTitle(newTitle: string) {
    this.saveSubject.next({ title: newTitle });
  }

  async onDeleteNote() {
    const note = this.noteService.activeNote();
    if (!note) return;

    const confirmed = await this.alertService.confirm(
      'Delete Note',
      `Are you sure you want to delete "${note.title || 'this note'}"?`
    );

    if (confirmed) {
      this.noteService.deleteNote(note.id, note.notebookId, '').subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    }
  }
}
