import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { LucideAngularModule, Plus, LayoutGrid, List, Loader2, Trash2, Edit3, MoreVertical } from 'lucide-angular';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ModalComponent, ReactiveFormsModule],
  templateUrl: './workspace-list.component.html'
})
export class WorkspaceListComponent implements OnInit {
  private fb = inject(FormBuilder);
  workspaceService = inject(WorkspaceService);
  private alertService = inject(AlertService);

  showCreateModal = signal(false);
  isEditMode = signal(false);
  selectedWorkspaceId = signal<string | null>(null);
  isSubmitting = signal(false);

  workspaceForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  readonly Trash2 = Trash2;
  readonly Edit3 = Edit3;

  ngOnInit() {
    // Initial fetch handled by DashboardShell to avoid NG0100
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedWorkspaceId.set(null);
    this.workspaceForm.reset();
    this.showCreateModal.set(true);
  }

  openEditModal(workspace: any) {
    this.isEditMode.set(true);
    this.selectedWorkspaceId.set(workspace.id);
    this.workspaceForm.patchValue({
      name: workspace.name,
      description: workspace.description || ''
    });
    this.showCreateModal.set(true);
  }

  async onDeleteWorkspace(workspace: any) {
    const confirmed = await this.alertService.confirm(
      'Delete Workspace',
      `Are you sure you want to delete "${workspace.name}"? This will delete all its notebooks and notes.`
    );
    if (confirmed) {
      this.workspaceService.deleteWorkspace(workspace.id).subscribe();
    }
  }

  onCreateWorkspace() {
    if (this.workspaceForm.valid) {
      this.isSubmitting.set(true);
      
      // Ensure no unwanted data is passed to payload
      const { name, description } = this.workspaceForm.value;
      const payload: any = { name };
      if (description) {
        payload.description = description;
      }

      const action = this.isEditMode() 
        ? this.workspaceService.updateWorkspace(this.selectedWorkspaceId()!, payload)
        : this.workspaceService.createWorkspace(payload);

      action.subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showCreateModal.set(false);
          this.workspaceForm.reset();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }
}
