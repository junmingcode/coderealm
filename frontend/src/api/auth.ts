import { api } from './index';
import type { User } from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),

  register: (data: { username: string; email: string; password: string }) =>
    api.post<User>('/auth/register', data),

  getUsers: () => api.get<User[]>('/auth/users'),

  updateUser: (id: number, data: Partial<User> & { is_admin?: boolean }) =>
    api.put<User>(`/auth/users/${id}`, data),

  deleteUser: (id: number) => api.delete(`/auth/users/${id}`),
};
