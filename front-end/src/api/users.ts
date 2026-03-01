import api from "./api";
import type { User } from "../types//users";

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get<User[]>("/users");
  return res.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await api.get<User>(`/users/${id}`);
  return res.data;
};

export const createUser = async (user: Partial<User>): Promise<User> => {
  const res = await api.post<User>("/users", user);
  return res.data;
};

export const updateUser = async (id: number, user: Partial<User>): Promise<User> => {
  const res = await api.put<User>(`/users/${id}`, user);
  return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const authenticateUser = async (username: string, password: string): Promise<User> => {
  const res = await api.post<User>("/users/auth/login", { username, password });
  return res.data;
};

