<template>
  <section>
    <div class="page-head">
      <div>
        <h2 class="page-title">백업 관리</h2>
        <p class="page-subtitle">관리자가 예약 로그 백업을 수동으로 실행하고 Google Drive 파일을 확인하며 오래된 백업을 정리할 수 있습니다.</p>
      </div>
      <n-space>
        <n-button secondary :loading="cleanupLoading" @click="cleanup">
          <template #icon>
            <n-icon :component="Trash2" />
          </template>
          오래된 백업 정리
        </n-button>
        <n-button type="primary" :loading="runLoading" @click="runBackup">
          <template #icon>
            <n-icon :component="UploadCloud" />
          </template>
          수동 백업
        </n-button>
      </n-space>
    </div>

    <n-card :bordered="false">
      <template #header>
        <n-space align="center" justify="space-between">
          <span>백업 파일</span>
          <n-button text @click="loadFiles">
            <template #icon>
              <n-icon :component="RefreshCw" />
            </template>
            새로고침
          </n-button>
        </n-space>
      </template>

      <n-data-table
        :columns="columns"
        :data="files"
        :loading="loading"
        :bordered="false"
        :pagination="{ pageSize: 8 }"
      />
    </n-card>
  </section>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { NButton, useDialog, useMessage, type DataTableColumns } from 'naive-ui';
import { RefreshCw, Trash2, UploadCloud } from '@lucide/vue';
import { backupApi } from '@/api/backup';
import { errorMessage } from '@/api/http';
import type { BackupFile } from '@/api/types';

const message = useMessage();
const dialog = useDialog();
const loading = ref(false);
const runLoading = ref(false);
const cleanupLoading = ref(false);
const files = ref<BackupFile[]>([]);

const columns: DataTableColumns<BackupFile> = [
  { title: '파일명', key: 'name' },
  { title: '파일 ID', key: 'id', ellipsis: { tooltip: true } },
  { title: '생성 시간', key: 'createdTime', render: (row) => formatDate(row.createdTime) },
  { title: '수정 시간', key: 'modifiedTime', render: (row) => formatDate(row.modifiedTime) },
  {
    title: '작업',
    key: 'actions',
    width: 110,
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          tertiary: true,
          type: 'error',
          disabled: !row.id,
          onClick: () => confirmDelete(row)
        },
        { default: () => '삭제' }
      )
  }
];

function formatDate(value?: string) {
  return value ? value.replace('T', ' ').slice(0, 16) : '-';
}

async function loadFiles() {
  loading.value = true;
  try {
    files.value = await backupApi.files();
  } catch (error) {
    message.error(errorMessage(error, '백업 파일 로드 실패'));
  } finally {
    loading.value = false;
  }
}

async function runBackup() {
  runLoading.value = true;
  try {
    const fileId = await backupApi.run();
    message.success(`백업 완료: ${fileId}`);
    await loadFiles();
  } catch (error) {
    message.error(errorMessage(error, '백업 실패'));
  } finally {
    runLoading.value = false;
  }
}

async function cleanup() {
  cleanupLoading.value = true;
  try {
    await backupApi.cleanup();
    message.success('오래된 백업이 정리되었습니다');
    await loadFiles();
  } catch (error) {
    message.error(errorMessage(error, '정리 실패'));
  } finally {
    cleanupLoading.value = false;
  }
}

function confirmDelete(file: BackupFile) {
  dialog.warning({
    title: '백업 파일 삭제',
    content: `${file.name || file.id}을(를) 삭제하시겠습니까?`,
    positiveText: '삭제',
    negativeText: '취소',
    onPositiveClick: async () => {
      if (!file.id) return;
      try {
        await backupApi.deleteFile(file.id);
        message.success('파일이 삭제되었습니다');
        await loadFiles();
      } catch (error) {
        message.error(errorMessage(error, '삭제 실패'));
      }
    }
  });
}

onMounted(loadFiles);
</script>