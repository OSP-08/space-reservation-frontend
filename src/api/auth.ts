import { http, unwrap } from './http';
import type { LoginRequest, SignUpRequest, TokenResponse, UserProfile } from './types';

export const authApi = {
  signUp(payload: SignUpRequest) {
    return http.post('/api/auth/signup', payload).then(unwrap<void>);
  },
  login(payload: LoginRequest) {
    return http.post('/api/auth/login', payload).then((res) => res.data as TokenResponse);
  },
  getMe() {
    return http.get('/api/users/me').then((res) => res.data as UserProfile);
  },
  logout() {
    return http.post('/api/auth/logout').then(unwrap<void>);
  }
};
