import { http, unwrap } from './http';
import type { Reservation, ReservationRequest } from './types';

export const reservationsApi = {
  create(payload: ReservationRequest) {
    return http.post('/api/reservations', payload).then(unwrap<Reservation>);
  },
  my() {
    return http.get('/api/reservations/my').then(unwrap<Reservation[]>);
  },
  bySpace(spaceId: number) {
    return http.get(`/api/reservations/space/${spaceId}`).then(unwrap<Reservation[]>);
  },
  cancel(id: number) {
    return http.delete(`/api/reservations/${id}`).then(unwrap<void>);
  }
};
