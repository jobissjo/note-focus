import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LucideAngularModule, Menu, X, Loader2 } from 'lucide-angular';
import { SidebarActionsService } from '../../../core/services/sidebar-actions.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { NotebookService } from '../../../core/services/notebook.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, LucideAngularModule, ModalComponent, ReactiveFormsModule],
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.css']
})
export class DashboardShellComponent {
  private fb = inject(FormBuilder);
  sidebarActions = inject(SidebarActionsService);
  workspaceService = inject(WorkspaceService);
  notebookService = inject(NotebookService);

  isMobileMenuOpen = signal(false);
  isSubmitting = signal(false);

  workspaceForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  notebookForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() {
    this.workspaceService.getWorkspaces().subscribe();
  }

  onCreateWorkspace() {
    if (this.workspaceForm.valid) {
      this.isSubmitting.set(true);
      const { name } = this.workspaceForm.value;
      const payload: any = { name };
      this.workspaceService.createWorkspace(payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.sidebarActions.showWorkspaceModal.set(false);
          this.workspaceForm.reset();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  onCreateNotebook() {
    const ws = this.sidebarActions.selectedWorkspace();
    if (this.notebookForm.valid && ws) {
      this.isSubmitting.set(true);
      this.notebookService.createNotebook(ws.id, this.notebookForm.value as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.sidebarActions.showNotebookModal.set(false);
          this.notebookForm.reset();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  readonly Menu = Menu;
  readonly X = X;
  readonly Loader2 = Loader2;
}
