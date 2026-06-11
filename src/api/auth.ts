import { http, unwrap } from './http';
import type { LoginRequest, SignUpRequest, TokenResponse } from './types';

export const authApi = {
  signUp(payload: SignUpRequest) {
    return http.post('/api/auth/signup', payload).then(unwrap<void>);
  },
  login(payload: LoginRequest) {
    return http.post('/api/auth/login', payload).then(unwrap<TokenResponse>);
  },
  reissue(refreshToken: string) {
    return http
      .post('/api/auth/reissue', undefined, {
        headers: {
          'Refresh-Token': refreshToken
        }
      })
      .then(unwrap<TokenResponse>);
  },
  logout() {
    return http.post('/api/auth/logout').then(unwrap<void>);
  }
};
