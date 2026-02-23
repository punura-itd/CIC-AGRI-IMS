import type { UserRole, Permission } from '../types/auth';
import { getPermissionsForRole } from '../config/roles';

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  const userPermissions = getPermissionsForRole(userRole);
  return userPermissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  const userPermissions = getPermissionsForRole(userRole);
  return permissions.some(permission => userPermissions.includes(permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  const userPermissions = getPermissionsForRole(userRole);
  return permissions.every(permission => userPermissions.includes(permission));
};

/**
 * Check if a user has a specific role
 */
export const hasRole = (userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean => {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};

/**
 * Check if a user can access a specific panel
 */
export const canAccessPanel = (userRole: UserRole, panel: string): boolean => {
  switch (panel) {
    case 'overview':
      return hasPermission(userRole, 'view_overview');
    case 'assets':
      return hasPermission(userRole, 'view_assets');
    case 'users':
      return hasPermission(userRole, 'view_users');
    case 'suppliers':
      return hasPermission(userRole, 'view_suppliers');
    case 'insurance':
      return hasPermission(userRole, 'view_insurance');
    case 'qr-scanner':
      return hasPermission(userRole, 'use_qr_scanner');
    default:
      return false;
  }
};

/**
 * Check if a user can perform CRUD operations on a specific resource
 */
export const canCreate = (userRole: UserRole, resource: string): boolean => {
  const permission = `create_${resource}` as Permission;
  return hasPermission(userRole, permission);
};

export const canUpdate = (userRole: UserRole, resource: string): boolean => {
  const permission = `update_${resource}` as Permission;
  return hasPermission(userRole, permission);
};

export const canDelete = (userRole: UserRole, resource: string): boolean => {
  const permission = `delete_${resource}` as Permission;
  return hasPermission(userRole, permission);
};

/**
 * Check if a user can edit QR scan data
 */
export const canEditQRData = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'edit_qr_data');
};

/**
 * Get accessible menu items for a user role
 */
export const getAccessibleMenuItems = (userRole: UserRole) => {
  const allMenuItems = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'assets', label: 'Assets', icon: 'Package' },
    { id: 'users', label: 'Users', icon: 'Users' },
    { id: 'suppliers', label: 'Suppliers', icon: 'Truck' },
    { id: 'insurance', label: 'Insurance', icon: 'Shield' },
    { id: 'qr-scanner', label: 'QR Code Scanner', icon: 'Barcode' },
  ];

  return allMenuItems.filter(item => canAccessPanel(userRole, item.id));
};
