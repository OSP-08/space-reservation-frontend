import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import LoginView from '@/views/LoginView.vue';
import AppLayout from '@/views/AppLayout.vue';
import BuildingsView from '@/views/BuildingsView.vue';
import SpaceTypeView from '@/views/SpaceTypeView.vue';
import SpacesView from '@/views/SpacesView.vue';
import ReservationsView from '@/views/ReservationsView.vue';
import AdminBackupView from '@/views/AdminBackupView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true }
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          redirect: '/buildings'
        },
        // 1단계: 건물 목록
        {
          path: 'buildings',
          name: 'buildings',
          component: BuildingsView
        },
        // 2단계: 건물 선택 → 공간 유형 선택
        {
          path: 'buildings/:buildingId',
          name: 'building-detail',
          component: SpaceTypeView
        },
        // 3단계: 유형 선택 → 공간 목록
        {
          path: 'buildings/:buildingId/:spaceType',
          name: 'spaces',
          component: SpacesView,
          props: true
        },
        // 내 예약
        {
          path: 'reservations',
          name: 'reservations',
          component: ReservationsView
        },
        // 관리자 백업
        {
          path: 'admin/backup',
          name: 'backup',
          component: AdminBackupView,
          meta: { admin: true }
        }
      ]
    }
  ]
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login' };
  }

  if (to.meta.admin && !auth.isAdmin) {
    return { name: 'buildings' };
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'buildings' };
  }

  // spaces 라우트는 반드시 buildingId, spaceType 파라미터가 필요
  if (to.name === 'spaces' && (!to.params.buildingId || !to.params.spaceType)) {
    return { name: 'buildings' };
  }

  return true;
});

export default router;
