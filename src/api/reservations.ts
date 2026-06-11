import { http, unwrap } from './http';
import type {
  BackendReservationRequest,
  Reservation,
  ReservationRequest,
  ReservationResponse,
  RoomAvailabilityResponse
} from './types';

function normalizeBackendDateTime(value: string): string {
  // 백엔드는 ISO LocalDateTime (초 포함) 을 기대.
  // 프런트에서 'YYYY-MM-DDTHH:mm' 또는 'YYYY-MM-DDTHH:mm:ss' 를 보낼 수 있음.
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
}

function toReservation(r: ReservationResponse): Reservation {
  return {
    id: r.id,
    spaceId: r.roomId,
    spaceName: r.roomName,
    spaceLocation: undefined,
    userName: r.userName,
    userEmail: undefined,
    startTime: r.startTime,
    endTime: r.endTime,
    purpose: undefined,
    // 백엔드: RESERVED|RETURNED|CANCELLED  →  프런트 표시: CONFIRMED|CANCELLED
    status: r.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
    createdAt: r.createdAt
  };
}

export const reservationsApi = {
  create(payload: ReservationRequest): Promise<Reservation> {
    const body: BackendReservationRequest = {
      roomId: payload.spaceId,
      startTime: normalizeBackendDateTime(payload.startTime),
      endTime: normalizeBackendDateTime(payload.endTime)
    };
    return http
      .post<ReservationResponse>('/api/reservations', body)
      .then(unwrap<ReservationResponse>)
      .then(toReservation);
  },
  my(): Promise<Reservation[]> {
    return http
      .get<ReservationResponse[]>('/api/reservations/me')
      .then(unwrap<ReservationResponse[]>)
      .then((list) => list.map(toReservation));
  },
  // 백엔드에는 공간별 예약 목록 엔드포인트가 없어 availability 의 점유 시간대를 변환
  async bySpace(spaceId: number): Promise<Reservation[]> {
    const data = await http
      .get<RoomAvailabilityResponse>(`/api/rooms/${spaceId}/availability`)
      .then(unwrap<RoomAvailabilityResponse>);
    return data.occupiedSlots.map((slot) => ({
      id: slot.reservationId,
      spaceId: data.roomId,
      spaceName: data.roomName,
      userName: slot.reservedBy,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'CONFIRMED' as const,
      createdAt: slot.startTime
    }));
  },
  cancel(id: number) {
    return http.delete<ReservationResponse>(`/api/reservations/${id}`).then(unwrap<ReservationResponse>);
  },
  returnReservation(id: number) {
    return http
      .post<ReservationResponse>(`/api/reservations/${id}/return`)
      .then(unwrap<ReservationResponse>)
      .then(toReservation);
  }
};
