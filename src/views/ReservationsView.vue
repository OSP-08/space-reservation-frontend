<template>
  <section>
    <div class="page-head">
      <div>
        <h2 class="page-title">我的预约</h2>
        <p class="page-subtitle">查看当前账号提交过的空间预约，并取消不再需要的时段。</p>
      </div>
      <n-button secondary @click="loadReservations">
        <template #icon>
          <n-icon :component="RefreshCw" />
        </template>
        刷新
      </n-button>
    </div>

    <div class="metric-grid">
      <n-card size="small">
        <n-statistic label="预约总数" :value="reservations.length" />
      </n-card>
      <n-card size="small">
        <n-statistic label="已确认" :value="confirmedCount" />
      </n-card>
      <n-card size="small">
        <n-statistic label="已取消" :value="cancelledCount" />
      </n-card>
    </div>

    <n-card :bordered="false">
      <n-data-table
        :columns="columns"
        :data="reservations"
        :loading="loading"
        :bordered="false"
        :pagination="{ pageSize: 8 }"
      />
    </n-card>
  </section>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NTag, useDialog, useMessage, type DataTableColumns } from 'naive-ui';
import { RefreshCw } from '@lucide/vue';
import { errorMessage } from '@/api/http';
import { reservationsApi } from '@/api/reservations';
import type { Reservation } from '@/api/types';

const message = useMessage();
const dialog = useDialog();
const loading = ref(false);
const reservations = ref<Reservation[]>([]);

const confirmedCount = computed(() => reservations.value.filter((item) => item.status === 'CONFIRMED').length);
const cancelledCount = computed(() => reservations.value.filter((item) => item.status === 'CANCELLED').length);

const columns: DataTableColumns<Reservation> = [
  { title: '空间', key: 'spaceName' },
  { title: '位置', key: 'spaceLocation' },
  { title: '开始', key: 'startTime', render: (row) => formatDate(row.startTime) },
  { title: '结束', key: 'endTime', render: (row) => formatDate(row.endTime) },
  { title: '用途', key: 'purpose' },
  {
    title: '状态',
    key: 'status',
    render: (row) =>
      h(
        NTag,
        { type: row.status === 'CONFIRMED' ? 'success' : 'default', bordered: false },
        { default: () => (row.status === 'CONFIRMED' ? '已确认' : '已取消') }
      )
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          tertiary: true,
          type: 'error',
          disabled: row.status !== 'CONFIRMED',
          onClick: () => confirmCancel(row)
        },
        { default: () => '取消预约' }
      )
  }
];

function formatDate(value: string) {
  return value ? value.replace('T', ' ').slice(0, 16) : '-';
}

async function loadReservations() {
  loading.value = true;
  try {
    reservations.value = await reservationsApi.my();
  } catch (error) {
    message.error(errorMessage(error, '预约加载失败'));
  } finally {
    loading.value = false;
  }
}

function confirmCancel(row: Reservation) {
  dialog.warning({
    title: '取消预约',
    content: `确定取消 ${row.spaceName} 的预约吗？`,
    positiveText: '取消预约',
    negativeText: '保留',
    onPositiveClick: async () => {
      try {
        await reservationsApi.cancel(row.id);
        message.success('预约已取消');
        await loadReservations();
      } catch (error) {
        message.error(errorMessage(error, '取消失败'));
      }
    }
  });
}

onMounted(loadReservations);
</script>
