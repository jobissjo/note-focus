import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { NotebookService } from '../../../core/services/notebook.service';
import { LucideAngularModule, Notebook as NotebookIcon, Plus, ChevronRight, Loader2, Settings, Trash2, Edit3, MoreVertical } from 'lucide-angular';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Router } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-workspace-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ModalComponent, ReactiveFormsModule],
  templateUrl: './workspace-detail.component.html'
})
export class WorkspaceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  workspaceService = inject(WorkspaceService);
  notebookService = inject(NotebookService);
  private alertService = inject(AlertService);

  notebooks = this.notebookService.notebooks;
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showEditNotebookModal = signal(false);
  selectedNotebook = signal<any>(null);
  isSubmitting = signal(false);

  notebookForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  workspaceForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.workspaceService.getWorkspaceById(id).subscribe();
        this.notebookService.getNotebooksForWorkspace(id).subscribe();
      }
    });
  }

  onCreateNotebook() {
    const ws = this.workspaceService.activeWorkspace();
    if (this.notebookForm.valid && ws) {
      this.isSubmitting.set(true);
      this.notebookService.createNotebook(ws.id, this.notebookForm.value as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showCreateModal.set(false);
          this.notebookForm.reset();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  async onDeleteWorkspace(workspace: any) {
    const confirmed = await this.alertService.confirm(
      'Delete Workspace',
      `Are you sure you want to delete "${workspace.name}"? This will also delete all its notebooks and notes.`
    );
    if (confirmed) {
      this.workspaceService.deleteWorkspace(workspace.id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  openEditModal(workspace: any) {
    this.workspaceForm.patchValue({
      name: workspace.name,
      description: workspace.description || ''
    });
    this.showEditModal.set(true);
  }

  onUpdateWorkspace() {
    const ws = this.workspaceService.activeWorkspace();
    if (this.workspaceForm.valid && ws) {
      this.isSubmitting.set(true);
      this.workspaceService.updateWorkspace(ws.id, this.workspaceForm.value as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showEditModal.set(false);
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  async onDeleteNotebook(notebook: any) {
    const confirmed = await this.alertService.confirm(
      'Delete Notebook',
      `Are you sure you want to delete "${notebook.name}"? This will delete all notes inside it.`
    );
    if (confirmed) {
      this.notebookService.deleteNotebook(notebook.workspaceId, notebook.id).subscribe();
    }
  }

  openEditNotebook(notebook: any) {
    this.selectedNotebook.set(notebook);
    this.notebookForm.patchValue({ name: notebook.name });
    this.showEditNotebookModal.set(true);
  }

  onUpdateNotebook() {
    const ws = this.workspaceService.activeWorkspace();
    const nb = this.selectedNotebook();
    if (this.notebookForm.valid && ws && nb) {
      this.isSubmitting.set(true);
      this.notebookService.updateNotebook(ws.id, nb.id, this.notebookForm.value as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showEditNotebookModal.set(false);
          this.notebookForm.reset();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  readonly Notebook = NotebookIcon;
  readonly Plus = Plus;
  readonly ChevronRight = ChevronRight;
  readonly Loader2 = Loader2;
  readonly Edit3 = Edit3;
  readonly Trash2 = Trash2;
  readonly Settings = Settings;
}
