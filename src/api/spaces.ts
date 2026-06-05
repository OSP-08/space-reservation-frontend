import { http, unwrap } from './http';
import type { Space, SpaceRequest } from './types';

export const spacesApi = {
  list() {
    return http.get('/api/spaces').then(unwrap<Space[]>);
  },
  get(id: number) {
    return http.get(`/api/spaces/${id}`).then(unwrap<Space>);
  },
  create(payload: SpaceRequest) {
    return http.post('/api/spaces', payload).then(unwrap<Space>);
  },
  update(id: number, payload: SpaceRequest) {
    return http.put(`/api/spaces/${id}`, payload).then(unwrap<Space>);
  },
  updateStatus(id: number, status: Space['status']) {
    return http.patch(`/api/spaces/${id}/status`, undefined, { params: { status } }).then(unwrap<Space>);
  }
};
