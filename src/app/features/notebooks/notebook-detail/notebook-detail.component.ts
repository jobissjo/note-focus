import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { NotebookService } from '../../../core/services/notebook.service';
import { NoteService } from '../../../core/services/note.service';
import { LucideAngularModule, StickyNote, Plus, ChevronRight, Hash, Eye, Trash2, Edit3, X, ExternalLink } from 'lucide-angular';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-notebook-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ModalComponent],
  templateUrl: './notebook-detail.component.html'
})
export class NotebookDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  notebookService = inject(NotebookService);
  noteService = inject(NoteService);
  private alertService = inject(AlertService);

  notes = this.noteService.notes;
  selectedNote = signal<any>(null);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.notebookService.getNotebookById(id).subscribe();
        this.noteService.getNotesForNotebook(id).subscribe();
      }
    });
  }

  createNewNote() {
    const nb = this.notebookService.activeNotebook();
    if (nb) {
      this.noteService.createNote(nb.id, nb.workspaceId, { 
        title: 'Untitled Note',
        content: { type: 'doc', content: [] }
      }).subscribe(note => {
        this.router.navigate(['/dashboard/notes', note.id]);
      });
    }
  }

  previewNote(note: any) {
    this.selectedNote.set(note);
  }

  async deleteNote(note: any) {
    const confirmed = await this.alertService.confirm(
      'Delete Note',
      `Are you sure you want to delete "${note.title || 'this note'}"?`
    );
    if (confirmed) {
      const nb = this.notebookService.activeNotebook();
      if (nb) {
        this.noteService.deleteNote(note.id, nb.id, nb.workspaceId).subscribe();
      }
    }
  }

  getPlainTextField(note: any): string {
    if (!note?.content?.content) return '';
    try {
      // Basic extraction of text from JSON structure
      return note.content.content
        .map((node: any) => node.content?.map((child: any) => child.text).join('') || '')
        .join('\n')
        .trim();
    } catch (e) {
      return '';
    }
  }

  readonly StickyNote = StickyNote;
  readonly Plus = Plus;
  readonly ChevronRight = ChevronRight;
  readonly Hash = Hash;
  readonly Eye = Eye;
  readonly Trash2 = Trash2;
  readonly Edit3 = Edit3;
  readonly X = X;
  readonly ExternalLink = ExternalLink;
}
