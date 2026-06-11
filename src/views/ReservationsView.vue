<template>
  <section>
    <div class="page-head">
      <div>
        <h2 class="page-title">내 예약</h2>
        <p class="page-subtitle">현재 계정에서 제출한 공간 예약을 확인하고 더 이상 필요하지 않은 시간대를 취소하세요.</p>
      </div>
      <n-button secondary @click="loadReservations">
        <template #icon>
          <n-icon :component="RefreshCw" />
        </template>
        새로고침
      </n-button>
    </div>

    <div class="metric-grid">
      <n-card size="small">
        <n-statistic label="총 예약 수" :value="reservations.length" />
      </n-card>
      <n-card size="small">
        <n-statistic label="확인됨" :value="confirmedCount" />
      </n-card>
      <n-card size="small">
        <n-statistic label="취소됨" :value="cancelledCount" />
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
  { title: '공간', key: 'spaceName' },
  { title: '예약자', key: 'userName' },
  { title: '시작', key: 'startTime', render: (row) => formatDate(row.startTime) },
  { title: '종료', key: 'endTime', render: (row) => formatDate(row.endTime) },
  {
    title: '상태',
    key: 'status',
    render: (row) =>
      h(
        NTag,
        { type: row.status === 'CONFIRMED' ? 'success' : 'default', bordered: false },
        { default: () => (row.status === 'CONFIRMED' ? '확인됨' : '취소됨') }
      )
  },
  {
    title: '작업',
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
        { default: () => '예약 취소' }
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
    message.error(errorMessage(error, '예약 로드 실패'));
  } finally {
    loading.value = false;
  }
}

function confirmCancel(row: Reservation) {
  dialog.warning({
    title: '예약 취소',
    content: `${row.spaceName} 예약을 취소하시겠습니까?`,
    positiveText: '예약 취소',
    negativeText: '유지',
    onPositiveClick: async () => {
      try {
        await reservationsApi.cancel(row.id);
        message.success('예약이 취소되었습니다');
        await loadReservations();
      } catch (error) {
        message.error(errorMessage(error, '취소 실패'));
      }
    }
  });
}

onMounted(loadReservations);
</script>