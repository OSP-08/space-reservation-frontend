import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import LoginView from '@/views/LoginView.vue';
import AppLayout from '@/views/AppLayout.vue';
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
          redirect: '/spaces'
        },
        {
          path: 'spaces',
          name: 'spaces',
          component: SpacesView
        },
        {
          path: 'reservations',
          name: 'reservations',
          component: ReservationsView
        },
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
    return { name: 'spaces' };
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'spaces' };
  }

  return true;
});

export default router;
