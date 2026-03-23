import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, LayoutGrid, List, Loader2, Trash2, Edit3, MoreVertical, Lock, Unlock, Pencil } from 'lucide-angular';
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
  authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  showCreateModal = signal(false);
  isEditMode = signal(false);
  selectedWorkspaceId = signal<string | null>(null);
  isSubmitting = signal(false);

  workspaceForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    isLocked: [false]
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

  async openEditModal(workspace: any) {
    if (workspace.isLocked) {
      const isVerified = await this.authService.requestPinVerification(
        'Access Locked Workspace',
        'Please enter your security PIN to edit this workspace.'
      );
      if (!isVerified) return;
    }

    this.isEditMode.set(true);
    this.selectedWorkspaceId.set(workspace.id);
    this.workspaceForm.patchValue({
      name: workspace.name,
      description: workspace.description || '',
      isLocked: workspace.isLocked || false
    });
    this.showCreateModal.set(true);
  }

  async onWorkspaceClick(workspace: any) {
    if (workspace.isLocked) {
      const isVerified = await this.authService.requestPinVerification(
        'Workspace Locked',
        'Please enter your security PIN to access this workspace.'
      );
      if (isVerified) {
        this.router.navigate(['/dashboard/workspaces', workspace.id]);
      } else {
        this.alertService.error('Access Denied', 'Invalid PIN or verification cancelled.');
      }
    } else {
      this.router.navigate(['/dashboard/workspaces', workspace.id]);
    }
  }

  async toggleLock(workspace: any) {
    const user = this.authService.currentUser();
    if (!user?.hasPin) {
      this.alertService.error('PIN Required', 'Please set a security PIN in settings before locking items.');
      return;
    }

    const isUnlocking = workspace.isLocked;
    
    if (isUnlocking) {
      const isVerified = await this.authService.requestPinVerification(
        'Unlock Workspace',
        'Please enter your security PIN to unlock this workspace.'
      );
      if (!isVerified) return;
    }

    const newLockStatus = !workspace.isLocked;
    this.workspaceService.updateWorkspace(workspace.id, { isLocked: newLockStatus }).subscribe({
      next: () => {
        this.alertService.success(
          newLockStatus ? 'Workspace Locked' : 'Workspace Unlocked',
          `"${workspace.name}" has been ${newLockStatus ? 'locked' : 'unlocked'}.`
        );
      }
    });
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
      const { name, description, isLocked } = this.workspaceForm.value;
      const payload: any = { name, isLocked };
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
