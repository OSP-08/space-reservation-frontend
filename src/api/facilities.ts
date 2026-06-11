import { http, unwrap } from './http';
import type { FacilityResponse } from './types';

export const facilitiesApi = {
  // 관리자 전용
  list() {
    return http
      .get<FacilityResponse[]>('/api/admin/facilities')
      .then(unwrap<FacilityResponse[]>);
  },
  create(name: string) {
    return http
      .post<FacilityResponse>('/api/admin/facilities', { name })
      .then(unwrap<FacilityResponse>);
  }
};
