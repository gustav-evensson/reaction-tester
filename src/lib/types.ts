export interface Score {
  id: string;
  score: number; // reaction time in milliseconds
  user_name: string;
  user_email: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  created_at: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  created_at: string;
}
