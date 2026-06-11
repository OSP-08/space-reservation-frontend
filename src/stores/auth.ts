import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authApi } from '@/api/auth';
import type { LoginRequest, SignUpRequest, TokenResponse, UserResponse } from '@/api/types';

const ACCESS_TOKEN = 'accessToken';
const USER_PROFILE = 'userProfile';

interface StoredUser {
  id?: number;
  username?: string;
  email?: string;
  name?: string;
  affiliation?: string;
  role?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem(ACCESS_TOKEN) || '');
  const user = ref<StoredUser | null>(
    JSON.parse(localStorage.getItem(USER_PROFILE) || 'null')
  );

  const isAuthenticated = computed(() => Boolean(accessToken.value));
  const isAdmin = computed(() => {
    const role = user.value?.role || '';
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  });

  function setToken(token: TokenResponse) {
    accessToken.value = token.accessToken;
    localStorage.setItem(ACCESS_TOKEN, token.accessToken);
  }

  function setUser(profile: UserResponse) {
    user.value = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      name: profile.name,
      affiliation: profile.affiliation,
      role: profile.role
    };
    localStorage.setItem(USER_PROFILE, JSON.stringify(user.value));
  }

  function clearSession() {
    accessToken.value = '';
    user.value = null;
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(USER_PROFILE);
  }

  async function login(payload: LoginRequest) {
    const token = await authApi.login(payload);
    setToken(token);
    // 백엔드 TokenResponse 에는 사용자 정보가 없으므로 /api/users/me 로 보강
    try {
      const profile = await authApi.me();
      setUser(profile);
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  async function signUp(payload: SignUpRequest) {
    await authApi.signUp(payload);
  }

  async function logout() {
    // 백엔드에 로그아웃 엔드포인트는 없음 (stateless JWT). 클라이언트에서만 정리.
    clearSession();
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    isAdmin,
    setToken,
    setUser,
    clearSession,
    login,
    signUp,
    logout
  };
});
