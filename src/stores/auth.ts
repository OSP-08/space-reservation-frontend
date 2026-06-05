import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authApi } from '@/api/auth';
import type { LoginRequest, SignUpRequest, TokenResponse } from '@/api/types';

const ACCESS_TOKEN = 'accessToken';
const REFRESH_TOKEN = 'refreshToken';
const USER_PROFILE = 'userProfile';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem(ACCESS_TOKEN) || '');
  const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN) || '');
  const user = ref<Pick<TokenResponse, 'email' | 'name' | 'role'> | null>(
    JSON.parse(localStorage.getItem(USER_PROFILE) || 'null')
  );

  const isAuthenticated = computed(() => Boolean(accessToken.value));
  const isAdmin = computed(() => {
    const role = user.value?.role || '';
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  });

  function setSession(token: TokenResponse) {
    accessToken.value = token.accessToken;
    refreshToken.value = token.refreshToken;
    user.value = {
      email: token.email,
      name: token.name,
      role: token.role
    };

    localStorage.setItem(ACCESS_TOKEN, token.accessToken);
    localStorage.setItem(REFRESH_TOKEN, token.refreshToken);
    localStorage.setItem(USER_PROFILE, JSON.stringify(user.value));
  }

  function clearSession() {
    accessToken.value = '';
    refreshToken.value = '';
    user.value = null;
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER_PROFILE);
  }

  async function login(payload: LoginRequest) {
    const token = await authApi.login(payload);
    setSession(token);
  }

  async function signUp(payload: SignUpRequest) {
    await authApi.signUp(payload);
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    isAdmin,
    setSession,
    clearSession,
    login,
    signUp,
    logout
  };
});
