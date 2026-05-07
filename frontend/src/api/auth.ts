import { api } from './index';

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),
};
