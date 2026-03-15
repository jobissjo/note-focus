export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  name?: string;
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
  access_token?: string;
  user: User;
}

export interface Diary {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  entries?: DiaryEntry[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface DiaryEntry {
  id: string;
  title?: string;
  content: any; // JSON object representing rich text
  date: string; // ISO String representing the entry's logical date
  diaryId: string;
  createdAt: string; 
  updatedAt: string;
}
