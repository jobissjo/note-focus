import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronRight, ChevronDown, Plus, Hash, Notebook as NotebookIcon, StickyNote, Settings, LogOut, Search, Command, Loader2, Sun, Moon, Book } from 'lucide-angular';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { NotebookService } from '../../../core/services/notebook.service';
import { NoteService } from '../../../core/services/note.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarActionsService } from '../../../core/services/sidebar-actions.service';
import { ThemeService } from '../../../core/services/theme.service';
import { DiaryService } from '../../../core/services/diary.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  workspaceService = inject(WorkspaceService);
  notebookService = inject(NotebookService);
  noteService = inject(NoteService);
  authService = inject(AuthService);
  sidebarActions = inject(SidebarActionsService);
  themeService = inject(ThemeService);
  diaryService = inject(DiaryService);

  isCollapsed = signal(false);
  expandedWorkspaces = signal<Set<string>>(new Set());
  expandedNotebooks = signal<Set<string>>(new Set());
  expandedDiaries = signal<Set<string>>(new Set());

  readonly ChevronRight = ChevronRight;
  readonly ChevronDown = ChevronDown;
  readonly Plus = Plus;
  readonly Hash = Hash;
  readonly NotebookIcon = NotebookIcon;
  readonly StickyNote = StickyNote;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly Search = Search;
  readonly Command = Command;
  readonly Loader2 = Loader2;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Book = Book;

  ngOnInit() {
    this.diaryService.fetchDiaries().subscribe();
  }

  createNote(workspaceId: string, notebookId: string) {
    this.noteService.createNote(notebookId, workspaceId, { 
      title: 'Untitled Note',
      content: { type: 'doc', content: [] }
    }).subscribe(note => {
      // Ensure notebook is expanded
      if (!this.expandedNotebooks().has(notebookId)) {
        this.toggleNotebook(workspaceId, notebookId);
      }
      // Navigate to new note
      this.router.navigate(['/dashboard/notes', note.id]);
    });
  }

  toggleWorkspace(id: string) {
    const isExpanding = !this.expandedWorkspaces().has(id);
    this.expandedWorkspaces.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });

    if (isExpanding) {
      this.workspaceService.fetchNotebooksForWorkspace(id).subscribe();
    }
  }

  navigateToDashboard(){
    this.router.navigate(['/dashboard'])
  }

  toggleNotebook(workspaceId: string, notebookId: string) {
    const isExpanding = !this.expandedNotebooks().has(notebookId);
    this.expandedNotebooks.update(set => {
      const newSet = new Set(set);
      if (newSet.has(notebookId)) newSet.delete(notebookId);
      else newSet.add(notebookId);
      return newSet;
    });

    if (isExpanding) {
      this.notebookService.fetchNotesForNotebook(workspaceId, notebookId).subscribe();
    }
  }
}
