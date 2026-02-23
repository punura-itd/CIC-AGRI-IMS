export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
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

export type UserRole = 'superadmin' | 'admin' | 'user';

export type Permission = 
  | 'view_overview'
  | 'view_assets'
  | 'create_assets'
  | 'update_assets'
  | 'delete_assets'
  | 'view_users'
  | 'create_users'
  | 'update_users'
  | 'delete_users'
  | 'view_suppliers'
  | 'create_suppliers'
  | 'update_suppliers'
  | 'delete_suppliers'
  | 'view_insurance'
  | 'create_insurance'
  | 'update_insurance'
  | 'delete_insurance'
  | 'use_qr_scanner'
  | 'edit_qr_data'
  | 'view_analytics'
  | 'manage_settings';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}