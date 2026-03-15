import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-shell/dashboard-shell.component').then(m => m.DashboardShellComponent),
    children: [
      { path: '', loadComponent: () => import('./features/workspace/workspace-list/workspace-list.component').then(m => m.WorkspaceListComponent) },
      { path: 'workspaces/:id', loadComponent: () => import('./features/workspace/workspace-detail/workspace-detail.component').then(m => m.WorkspaceDetailComponent) },
      { path: 'notebooks/:id', loadComponent: () => import('./features/notebooks/notebook-detail/notebook-detail.component').then(m => m.NotebookDetailComponent) },
      { path: 'notes/:id', loadComponent: () => import('./features/notes/note-editor/note-editor.component').then(m => m.NoteEditorComponent) }
    ]
  }
];
