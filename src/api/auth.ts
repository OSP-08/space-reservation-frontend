import { http, unwrap } from './http';
import type {
  BackendTokenResponse,
  LoginRequest,
  SignUpRequest,
  TokenResponse,
  UserResponse
} from './types';

export const authApi = {
  signUp(payload: SignUpRequest) {
    return http
      .post<UserResponse>('/api/auth/signup', {
        username: payload.username,
        password: payload.password,
        name: payload.name,
        email: payload.email,
        affiliation: payload.affiliation
      })
      .then(unwrap<UserResponse>);
  },
  login(payload: LoginRequest): Promise<TokenResponse> {
    return http
      .post<BackendTokenResponse>('/api/auth/login', payload)
      .then(unwrap<BackendTokenResponse>);
  },
  me() {
    return http.get<UserResponse>('/api/users/me').then(unwrap<UserResponse>);
  }
};
