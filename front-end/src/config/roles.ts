import type { UserRole, Permission } from '../types/auth';

// Role-based permissions configuration
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: [
    'view_overview',
    'view_assets',
    'create_assets',
    'update_assets',
    'delete_assets',
    'view_users',
    'create_users',
    'update_users',
    'delete_users',
    'view_suppliers',
    'create_suppliers',
    'update_suppliers',
    'delete_suppliers',
    'view_insurance',
    'create_insurance',
    'update_insurance',
    'delete_insurance',
    'use_qr_scanner',
    'edit_qr_data',
    'view_analytics',
    'manage_settings'
  ],
  admin: [
    'view_overview',
    'view_assets',
    'view_users',
    'view_suppliers',
    'view_insurance',
    'use_qr_scanner',
    'view_analytics'
  ],
  user: [
    'use_qr_scanner'
  ]
};

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

// Role display names and colors
export const ROLE_CONFIG = {
  superadmin: {
    label: 'Super Admin',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  admin: {
    label: 'Admin',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  user: {
    label: 'User',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
};