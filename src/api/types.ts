export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest extends LoginRequest {
  name: string;
  organization?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  name: string;
  role: string;
}

export interface Space {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  facilities?: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  createdAt: string;
}

export interface SpaceRequest {
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  facilities?: string;
}

export interface Reservation {
  id: number;
  spaceId: number;
  spaceName: string;
  spaceLocation?: string;
  userName: string;
  userEmail: string;
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

export interface BackupFile {
  id?: string;
  name?: string;
  mimeType?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}
