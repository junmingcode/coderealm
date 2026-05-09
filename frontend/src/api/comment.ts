import { api } from './index';

export const commentApi = {
  getAdminList: (params: { page?: number; page_size?: number; status?: string }) =>
    api.get('/admin/comments', { params }),

  updateStatus: (id: number, status: string) =>
    api.put(`/admin/comments/${id}/status`, { status }),

  remove: (id: number) => api.delete(`/admin/comments/${id}`),
};
