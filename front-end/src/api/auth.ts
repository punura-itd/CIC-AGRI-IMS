import api from "./api";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
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
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Login user
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<{ user: User; token: string }>>("/auth/login", credentials);
  return {
    success: response.data.success,
    message: response.data.message,
    data: response.data.data
  };
};

// Logout user
export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>("/auth/logout");
  return response.data;
};

// Get current user profile
export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>("/auth/profile");
  return response.data;
};

// Refresh token
export const refreshToken = async (): Promise<ApiResponse<{ token: string }>> => {
  const response = await api.post<ApiResponse<{ token: string }>>("/auth/refresh-token");
  return response.data;
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
  const response = await api.put<ApiResponse<null>>("/auth/change-password", {
    currentPassword,
    newPassword
  });
  return response.data;
};
