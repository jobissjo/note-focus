export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  ownerId: string;
  notebooks?: Notebook[];
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  name: string;
  emoji?: string;
  workspaceId: string;
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: any; // JSON based rich text
  emoji?: string;
  notebookId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
