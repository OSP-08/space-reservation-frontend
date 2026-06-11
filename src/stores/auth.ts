import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authApi } from '@/api/auth';
import type { LoginRequest, SignUpRequest, UserProfile } from '@/api/types';

const ACCESS_TOKEN = 'accessToken';
const USER_PROFILE = 'userProfile';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem(ACCESS_TOKEN) || '');
  const user = ref<UserProfile | null>(
    JSON.parse(localStorage.getItem(USER_PROFILE) || 'null')
  );

  const isAuthenticated = computed(() => Boolean(accessToken.value));
  const isAdmin = computed(() => {
    const role = user.value?.role || '';
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  });

  function setToken(token: string) {
    accessToken.value = token;
    localStorage.setItem(ACCESS_TOKEN, token);
  }

  function setUser(profile: UserProfile) {
    user.value = profile;
    localStorage.setItem(USER_PROFILE, JSON.stringify(profile));
  }

  function clearSession() {
    accessToken.value = '';
    user.value = null;
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(USER_PROFILE);
  }

  async function login(payload: LoginRequest) {
    const token = await authApi.login(payload);
    setToken(token.accessToken);
    const profile = await authApi.getMe();
    setUser(profile);
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
