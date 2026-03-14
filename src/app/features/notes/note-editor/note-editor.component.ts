import { Component, inject, OnDestroy, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NoteService } from '../../../core/services/note.service';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, Clock, Trash2, Maximize2, Share2 } from 'lucide-angular';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, NgxEditorModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col bg-white dark:bg-neutral-950">
      <!-- Top Bar -->
      <header class="h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="text-xl">{{ noteService.activeNote()?.emoji || '📄' }}</div>
          <input 
            [ngModel]="noteService.activeNote()?.title"
            (ngModelChange)="updateTitle($event)"
            class="bg-transparent border-none outline-none font-bold text-lg w-64 focus:ring-0 placeholder:text-neutral-400"
            placeholder="Untitled Note"
          />
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
             <lucide-icon [name]="'Clock'" class="h-3.5 w-3.5" />
             <span>Saved just now</span>
          </div>
          <div class="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1"></div>
          <button class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 transition-colors">
            <lucide-icon [name]="'Share2'" class="h-4 w-4" />
          </button>
          <button class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 transition-colors">
            <lucide-icon [name]="'Maximize2'" class="h-4 w-4" />
          </button>
          <button class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors">
            <lucide-icon [name]="'Trash2'" class="h-4 w-4" />
          </button>
        </div>
      </header>

      <!-- Editor Area -->
      <div class="flex-1 overflow-y-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <div class="editor-container prose dark:prose-invert max-w-none">
            @if (isBrowser) {
              <ngx-editor-menu [editor]="editor" [toolbar]="toolbar"></ngx-editor-menu>
              <ngx-editor
                [editor]="editor"
                [ngModel]="content()"
                (ngModelChange)="onContentChange($event)"
                [placeholder]="'Type something awesome...'"
              ></ngx-editor>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @reference "tailwindcss";
    :host ::ng-deep {
      .NgxEditor__MenuBar {
        @apply bg-transparent border-none p-0 mb-8 sticky top-0 z-10 backdrop-blur-md;
      }
      .NgxEditor__MenuItem--Icon {
        @apply rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors;
      }
      .NgxEditor__Content {
        @apply border-none p-0 focus:ring-0 min-h-[500px];
      }
    }
  `]
})
export class NoteEditorComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  noteService = inject(NoteService);
  isBrowser = isPlatformBrowser(this.platformId);

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

  ngOnInit(): void {
    if (this.isBrowser) {
      this.editor = new Editor();
    }
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.noteService.getNoteById(id).subscribe(note => {
          this.content.set(note.content);
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  onContentChange(newContent: any) {
    this.content.set(newContent);
    // Auto-save logic here
    const noteId = this.noteService.activeNote()?.id;
    if (noteId) {
      this.noteService.updateNote(noteId, { content: newContent }).subscribe();
    }
  }

  updateTitle(newTitle: string) {
    const noteId = this.noteService.activeNote()?.id;
    if (noteId) {
      this.noteService.updateNote(noteId, { title: newTitle }).subscribe();
    }
  }
}
