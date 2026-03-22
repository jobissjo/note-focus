import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, LayoutGrid, List, Loader2, Trash2, Edit3, MoreVertical, Lock, Unlock, Pencil } from 'lucide-angular';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertService } from '../../../core/services/alert.service';
import Swal from 'sweetalert2';

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

  openEditModal(workspace: any) {
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
      const isDark = document.documentElement.classList.contains('dark');
      const { value: pin } = await Swal.fire({
        title: 'Workspace Locked',
        text: 'Please enter your security PIN to access this workspace.',
        input: 'password',
        inputPlaceholder: 'Enter PIN',
        inputAttributes: {
          maxlength: '10',
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Unlock',
        confirmButtonColor: 'var(--accent)',
        background: isDark ? '#171717' : '#ffffff',
        color: isDark ? '#ffffff' : '#171717',
        customClass: {
          popup: 'rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl',
          input: 'rounded-xl border border-neutral-200 dark:border-neutral-800'
        }
      });

      if (pin) {
        this.authService.verifyPin(pin).subscribe({
          next: () => {
            this.router.navigate(['/dashboard/workspaces', workspace.id]);
          },
          error: (err) => {
            this.alertService.error('Invalid PIN', err.error?.message || 'Access denied.');
          }
        });
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
