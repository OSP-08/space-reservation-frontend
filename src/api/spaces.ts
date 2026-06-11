import { http, unwrap } from './http';
import type {
  RoomAvailabilityResponse,
  RoomRequest,
  RoomResponse,
  Space,
  SpaceRequest
} from './types';

function toSpace(r: RoomResponse): Space {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    capacity: r.capacity ?? 1,
    location: r.location,
    facilities: (r.facilities || []).map((f) => f.name).join(', '),
    facilityIds: (r.facilities || []).map((f) => f.id),
    status: r.active ? 'AVAILABLE' : 'UNAVAILABLE',
    spaceType: r.roomType,
    building: r.building
  };
}

function toRoomRequest(payload: SpaceRequest, active?: boolean): RoomRequest {
  return {
    name: payload.name,
    location: payload.location,
    capacity: payload.capacity,
    description: payload.description,
    active,
    building: payload.building,
    roomType: payload.spaceType,
    facilityIds: payload.facilityIds
  };
}

export const spacesApi = {
  list(): Promise<Space[]> {
    return http
      .get<RoomResponse[]>('/api/rooms')
      .then(unwrap<RoomResponse[]>)
      .then((rooms) => rooms.map(toSpace));
  },
  get(id: number): Promise<Space> {
    return http
      .get<RoomResponse>(`/api/rooms/${id}`)
      .then(unwrap<RoomResponse>)
      .then(toSpace);
  },
  availability(id: number) {
    return http
      .get<RoomAvailabilityResponse>(`/api/rooms/${id}/availability`)
      .then(unwrap<RoomAvailabilityResponse>);
  },
  create(payload: SpaceRequest): Promise<Space> {
    return http
      .post<RoomResponse>('/api/admin/rooms', toRoomRequest(payload, true))
      .then(unwrap<RoomResponse>)
      .then(toSpace);
  },
  update(id: number, payload: SpaceRequest, active?: boolean): Promise<Space> {
    return http
      .put<RoomResponse>(`/api/admin/rooms/${id}`, toRoomRequest(payload, active))
      .then(unwrap<RoomResponse>)
      .then(toSpace);
  },
  // 백엔드에는 status 전용 엔드포인트가 없어 update 로 active 토글
  async updateStatus(id: number, status: Space['status']): Promise<Space> {
    const current = await this.get(id);
    return this.update(
      id,
      {
        name: current.name,
        description: current.description,
        capacity: current.capacity,
        location: current.location,
        facilities: current.facilities,
        facilityIds: current.facilityIds,
        spaceType: current.spaceType,
        building: current.building
      },
      status === 'AVAILABLE'
    );
  },
  remove(id: number) {
    return http.delete<void>(`/api/admin/rooms/${id}`).then(unwrap<void>);
  }
};
