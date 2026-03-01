export interface User {
  id: number;
  name: string;
  email: string;
  username: string | null;
  password?: string | null; // Optional since we won't always include it
  role: string;
  department: string;
  status: string;
  phone?: string;
  joinDate?: string;
  lastLogin?: string;
  permissions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  department: string;
  status: string;
  phone?: string;
  joinDate?: string;
  lastLogin?: string;
  permissions?: string;
  createdAt?: string;
  updatedAt?: string;
}