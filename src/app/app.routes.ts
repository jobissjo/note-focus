import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard-shell/dashboard-shell.component').then(m => m.DashboardShellComponent),
    children: [
      { path: '', loadComponent: () => import('./features/workspace/workspace-list/workspace-list.component').then(m => m.WorkspaceListComponent) },
      { path: 'workspaces/:id', loadComponent: () => import('./features/workspace/workspace-detail/workspace-detail.component').then(m => m.WorkspaceDetailComponent) },
      { path: 'notebooks/:id', loadComponent: () => import('./features/notebooks/notebook-detail/notebook-detail.component').then(m => m.NotebookDetailComponent) },
      { path: 'notes/:id', loadComponent: () => import('./features/notes/note-editor/note-editor.component').then(m => m.NoteEditorComponent) },
      { path: 'diaries', loadComponent: () => import('./features/diaries/diary-list/diary-list.component').then(m => m.DiaryListComponent) },
      { path: 'diaries/:id', loadComponent: () => import('./features/diaries/diary-detail/diary-detail.component').then(m => m.DiaryDetailComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) }
    ]
  }
];
