import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, logout as logoutApi, getProfile, type User as ApiUser } from '../api/auth';
import type { Permission, UserRole } from '../types/auth';
import { getPermissionsForRole } from '../config/roles';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: ApiUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => ({ success: false, message: '' }),
  logout: async () => {},
  refreshUser: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    // Skip auth check on startup to prevent interference with login
    // The login process will handle setting the authentication state
    setLoading(false);
  }, []);


  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string }> => {
    console.log('Login attempt with credentials:', credentials);
    try {
      setLoading(true);
      const response = await loginApi(credentials);
      console.log('Login API response:', response);
      
      if (response.success && response.data) {
        // Set user data from login response
        console.log('Login successful, user data:', response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('User state set, isAuthenticated should be true now');
        
        // Test if session is working by making a simple API call
        setTimeout(async () => {
          console.log('Testing session with a simple API call...');
          try {
            const testResponse = await getProfile();
            console.log('Session test successful:', testResponse);
          } catch (error) {
            console.error('Session test failed:', error);
            console.log('This indicates the backend session is not working properly');
          }
        }, 500); // Wait 500ms for session to be established
        
        return { success: true, message: response.message };
      } else {
        console.log('Login response not successful:', response);
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Refresh user failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Map backend role names to our UserRole type
  const mapRoleToUserRole = (role: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
      'superadmin': 'superadmin',
      'super_admin': 'superadmin',
      'administrator': 'superadmin',
      'admin': 'admin',
      'manager': 'admin',
      'user': 'user',
      'employee': 'user',
      'staff': 'user'
    };
    return roleMap[role.toLowerCase()] || 'user';
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    // Convert string role to UserRole type
    const userRole = mapRoleToUserRole(user.role);
    console.log('Checking permission:', permission, 'for user role:', user.role, 'mapped to:', userRole);
    const userPermissions = getPermissionsForRole(userRole);
    console.log('User permissions:', userPermissions);
    return userPermissions.includes(permission);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const userRole = mapRoleToUserRole(user.role);
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  };

  // Test function to manually check session (can be called from browser console)
  const testSession = async () => {
    console.log('Testing session manually...');
    console.log('Current cookies:', document.cookie);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    
    try {
      const response = await getProfile();
      console.log('Session test successful:', response);
      return true;
    } catch (error) {
      console.error('Session test failed:', error);
      return false;
    }
  };

  // Make testSession available globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).testSession = testSession;
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
    testSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;