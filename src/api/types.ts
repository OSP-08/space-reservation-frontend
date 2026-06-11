// ──────────── 백엔드(Spring Boot) 원본 응답/요청 타입 ────────────
export interface BackendTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
}

export interface UserResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  affiliation: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface FacilityResponse {
  id: number;
  name: string;
}

export type RoomType = 'MEETING_ROOM' | 'INDIVIDUAL_SEAT';

export interface RoomResponse {
  id: number;
  name: string;
  location?: string;
  capacity: number;
  description?: string;
  active: boolean;
  building?: string;
  roomType?: RoomType;
  facilities: FacilityResponse[];
}

export interface RoomRequest {
  name: string;
  location?: string;
  capacity?: number;
  description?: string;
  active?: boolean;
  building?: string;
  roomType?: RoomType;
  facilityIds?: number[];
}

export type BackendReservationStatus = 'RESERVED' | 'RETURNED' | 'CANCELLED';

export interface ReservationResponse {
  id: number;
  roomId: number;
  roomName: string;
  userId: number;
  userName: string;
  startTime: string;
  endTime: string;
  status: BackendReservationStatus;
  createdAt: string;
}

export interface BackendReservationRequest {
  roomId: number;
  startTime: string;
  endTime: string;
}

export interface TimeSlotResponse {
  reservationId: number;
  startTime: string;
  endTime: string;
  reservedBy: string;
}

export interface RoomAvailabilityResponse {
  roomId: number;
  roomName: string;
  active: boolean;
  facilities: FacilityResponse[];
  occupiedSlots: TimeSlotResponse[];
}

// ──────────── 프론트엔드 뷰가 사용하는 형태 (어댑터로 매핑) ────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
  name: string;
  email?: string;
  affiliation?: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
}

export type SpaceType = RoomType;

export interface Space {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  facilities?: string;
  facilityIds?: number[];
  status: 'AVAILABLE' | 'UNAVAILABLE';
  spaceType?: SpaceType;
  building?: string;
  createdAt?: string;
}

export interface SpaceRequest {
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  facilities?: string;
  facilityIds?: number[];
  spaceType?: SpaceType;
  building?: string;
}

export interface Reservation {
  id: number;
  spaceId: number;
  spaceName: string;
  spaceLocation?: string;
  userName: string;
  userEmail?: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface ReservationRequest {
  spaceId: number;
  startTime: string;
  endTime: string;
  purpose?: string;
}
