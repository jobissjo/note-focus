import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarActionsService {
  showWorkspaceModal = signal(false);
  showNotebookModal = signal(false);
  selectedWorkspace = signal<any>(null);

  openWorkspaceModal() {
    this.showWorkspaceModal.set(true);
  }

  openNotebookModal(workspace: any) {
    this.selectedWorkspace.set(workspace);
    this.showNotebookModal.set(true);
  }

  closeAll() {
    this.showWorkspaceModal.set(false);
    this.showNotebookModal.set(false);
  }
}
