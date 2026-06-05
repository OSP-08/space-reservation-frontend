<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui';

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0f766e',
    primaryColorHover: '#0d9488',
    primaryColorPressed: '#115e59',
    infoColor: '#2563eb',
    successColor: '#16a34a',
    warningColor: '#d97706',
    errorColor: '#dc2626',
    borderRadius: '8px',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  Card: {
    borderRadius: '8px'
  },
  Button: {
    borderRadiusMedium: '8px',
    borderRadiusLarge: '8px'
  }
};
</script>
