<template>
  <section>
    <div class="page-head">
      <div>
        <h2 class="page-title">백업 관리</h2>
        <p class="page-subtitle">관리자가 예약 로그를 Google Drive 로 수동 백업합니다.</p>
      </div>
      <n-space>
        <n-button type="primary" :loading="runLoading" @click="runBackup">
          <template #icon>
            <n-icon :component="UploadCloud" />
          </template>
          수동 백업
        </n-button>
      </n-space>
    </div>

    <n-card :bordered="false">
      <n-space vertical :size="16">
        <n-alert type="info" :show-icon="true">
          백엔드는 <code>POST /api/admin/backup</code> 엔드포인트만 제공합니다.
          버튼을 누르면 서버가 현재 예약 내역을 Google Drive 에 업로드합니다.
        </n-alert>

        <div v-if="lastResult">
          <n-text strong>최근 백업 결과</n-text>
          <n-card size="small" :bordered="false" style="margin-top:8px; background:#f8fafc">
            <n-text>{{ lastResult }}</n-text>
            <div v-if="lastRunAt" class="muted" style="margin-top:4px; font-size:12px">
              실행 시각: {{ lastRunAt }}
            </div>
          </n-card>
        </div>
        <n-empty v-else description="아직 실행된 백업이 없습니다" />
      </n-space>
    </n-card>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { UploadCloud } from '@lucide/vue';
import { backupApi } from '@/api/backup';
import { errorMessage } from '@/api/http';

const message = useMessage();
const runLoading = ref(false);
const lastResult = ref<string>('');
const lastRunAt = ref<string>('');

async function runBackup() {
  runLoading.value = true;
  try {
    const result = await backupApi.run();
    lastResult.value = result;
    lastRunAt.value = new Date().toLocaleString();
    message.success('백업이 완료되었습니다');
  } catch (error) {
    message.error(errorMessage(error, '백업 실패'));
  } finally {
    runLoading.value = false;
  }
}
</script>

<style scoped>
.muted {
  color: #6b7280;
}
</style>
