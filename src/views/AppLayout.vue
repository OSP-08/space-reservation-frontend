<template>
  <n-layout has-sider class="app-layout">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="0"
      :width="232"
      :collapsed="isMobile && collapsed"
      :show-trigger="false"
    >
      <div class="sidebar-brand">
        <div class="brand-mark">
          <n-icon :component="Building2" />
        </div>
        <span>空间预约</span>
      </div>

      <n-menu
        :value="activeKey"
        :options="menuOptions"
        :indent="18"
        @update:value="go"
      />
    </n-layout-sider>

    <n-layout class="page-shell">
      <header class="topbar">
        <n-button v-if="isMobile" quaternary circle @click="collapsed = !collapsed">
          <template #icon>
            <n-icon :component="Menu" />
          </template>
        </n-button>
        <div v-else />

        <n-space align="center" :size="12">
          <n-tag :bordered="false" type="success">{{ auth.user?.role || 'USER' }}</n-tag>
          <n-dropdown :options="profileOptions" @select="handleProfile">
            <n-button secondary>
              <template #icon>
                <n-icon :component="UserRound" />
              </template>
              {{ auth.user?.name || auth.user?.email }}
            </n-button>
          </n-dropdown>
        </n-space>
      </header>

      <main class="content">
        <router-view />
      </main>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref, type Component } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { NIcon, useMessage, type MenuOption } from 'naive-ui';
import { Archive, Building2, CalendarDays, LogOut, Menu, UserRound } from '@lucide/vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const auth = useAuthStore();
const collapsed = ref(false);
const width = ref(window.innerWidth);

const isMobile = computed(() => width.value < 860);
const activeKey = computed(() => String(route.name || 'spaces'));

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

function renderLink(label: string, to: string) {
  return () => h(RouterLink, { to }, { default: () => label });
}

const menuOptions = computed<MenuOption[]>(() => {
  const options: MenuOption[] = [
    {
      label: renderLink('空间', '/spaces'),
      key: 'spaces',
      icon: renderIcon(Building2)
    },
    {
      label: renderLink('我的预约', '/reservations'),
      key: 'reservations',
      icon: renderIcon(CalendarDays)
    }
  ];

  if (auth.isAdmin) {
    options.push({
      label: renderLink('备份管理', '/admin/backup'),
      key: 'backup',
      icon: renderIcon(Archive)
    });
  }

  return options;
});

const profileOptions = [
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOut)
  }
];

function go() {
  if (isMobile.value) {
    collapsed.value = true;
  }
}

async function handleProfile(key: string) {
  if (key === 'logout') {
    await auth.logout();
    message.success('已退出登录');
    await router.push({ name: 'login' });
  }
}

function syncWidth() {
  width.value = window.innerWidth;
  collapsed.value = window.innerWidth < 860;
}

onMounted(() => {
  syncWidth();
  window.addEventListener('resize', syncWidth);
});

onUnmounted(() => window.removeEventListener('resize', syncWidth));
</script>
