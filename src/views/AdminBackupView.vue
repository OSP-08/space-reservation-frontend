<template>
  <section>
    <div class="page-head">
      <div>
        <h2 class="page-title">备份管理</h2>
        <p class="page-subtitle">管理员可以手动执行预约日志备份、查看 Google Drive 文件并清理旧备份。</p>
      </div>
      <n-space>
        <n-button secondary :loading="cleanupLoading" @click="cleanup">
          <template #icon>
            <n-icon :component="Trash2" />
          </template>
          清理旧备份
        </n-button>
        <n-button type="primary" :loading="runLoading" @click="runBackup">
          <template #icon>
            <n-icon :component="UploadCloud" />
          </template>
          手动备份
        </n-button>
      </n-space>
    </div>

    <n-card :bordered="false">
      <template #header>
        <n-space align="center" justify="space-between">
          <span>备份文件</span>
          <n-button text @click="loadFiles">
            <template #icon>
              <n-icon :component="RefreshCw" />
            </template>
            刷新
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
  { title: '文件名', key: 'name' },
  { title: '文件 ID', key: 'id', ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'createdTime', render: (row) => formatDate(row.createdTime) },
  { title: '更新时间', key: 'modifiedTime', render: (row) => formatDate(row.modifiedTime) },
  {
    title: '操作',
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
        { default: () => '删除' }
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
    message.error(errorMessage(error, '备份文件加载失败'));
  } finally {
    loading.value = false;
  }
}

async function runBackup() {
  runLoading.value = true;
  try {
    const fileId = await backupApi.run();
    message.success(`备份完成：${fileId}`);
    await loadFiles();
  } catch (error) {
    message.error(errorMessage(error, '备份失败'));
  } finally {
    runLoading.value = false;
  }
}

async function cleanup() {
  cleanupLoading.value = true;
  try {
    await backupApi.cleanup();
    message.success('旧备份已清理');
    await loadFiles();
  } catch (error) {
    message.error(errorMessage(error, '清理失败'));
  } finally {
    cleanupLoading.value = false;
  }
}

function confirmDelete(file: BackupFile) {
  dialog.warning({
    title: '删除备份文件',
    content: `确定删除 ${file.name || file.id} 吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      if (!file.id) return;
      try {
        await backupApi.deleteFile(file.id);
        message.success('文件已删除');
        await loadFiles();
      } catch (error) {
        message.error(errorMessage(error, '删除失败'));
      }
    }
  });
}

onMounted(loadFiles);
</script>
