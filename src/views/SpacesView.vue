<template>
  <section>
    <div class="page-head">
      <div>
        <h2 class="page-title">空间</h2>
        <p class="page-subtitle">查看可预约空间，管理员可以维护空间资料和可用状态。</p>
      </div>
      <n-button v-if="auth.isAdmin" type="primary" @click="openSpaceForm()">
        <template #icon>
          <n-icon :component="Plus" />
        </template>
        新建空间
      </n-button>
    </div>

    <div class="metric-grid">
      <n-card size="small">
        <n-statistic label="空间总数" :value="spaces.length" />
      </n-card>
      <n-card size="small">
        <n-statistic label="可用空间" :value="availableCount" />
      </n-card>
      <n-card size="small">
        <n-statistic label="最大容量" :value="maxCapacity" />
      </n-card>
    </div>

    <div class="toolbar">
      <n-input v-model:value="keyword" clearable placeholder="搜索空间、位置或设施">
        <template #prefix>
          <n-icon :component="Search" />
        </template>
      </n-input>
      <n-segmented v-model:value="statusFilter" :options="statusOptions" />
    </div>

    <n-spin :show="loading">
      <n-empty v-if="!filteredSpaces.length" description="暂无匹配空间" />
      <div v-else class="space-grid">
        <n-card v-for="space in filteredSpaces" :key="space.id" class="space-card" :bordered="false">
          <div class="space-card__top">
            <div>
              <n-space align="center" :size="8">
                <h3 style="margin: 0">{{ space.name }}</h3>
                <n-tag :type="space.status === 'AVAILABLE' ? 'success' : 'warning'" size="small">
                  {{ space.status === 'AVAILABLE' ? '可用' : '停用' }}
                </n-tag>
              </n-space>
              <p class="muted">{{ space.location || '未填写位置' }}</p>
            </div>
            <n-tag :bordered="false">{{ space.capacity }} 人</n-tag>
          </div>

          <n-ellipsis :line-clamp="2" class="muted">
            {{ space.description || '暂无描述' }}
          </n-ellipsis>

          <n-divider />

          <n-space vertical :size="10">
            <n-text depth="3">设施：{{ space.facilities || '未填写' }}</n-text>
            <div class="row-actions">
              <n-button
                type="primary"
                secondary
                :disabled="space.status !== 'AVAILABLE'"
                @click="openReservation(space)"
              >
                <template #icon>
                  <n-icon :component="CalendarPlus" />
                </template>
                预约
              </n-button>
              <n-button secondary @click="openSchedule(space)">
                <template #icon>
                  <n-icon :component="Clock3" />
                </template>
                时段
              </n-button>
              <template v-if="auth.isAdmin">
                <n-button secondary @click="openSpaceForm(space)">
                  <template #icon>
                    <n-icon :component="Pencil" />
                  </template>
                  编辑
                </n-button>
                <n-button secondary @click="toggleStatus(space)">
                  <template #icon>
                    <n-icon :component="Power" />
                  </template>
                  {{ space.status === 'AVAILABLE' ? '停用' : '启用' }}
                </n-button>
              </template>
            </div>
          </n-space>
        </n-card>
      </div>
    </n-spin>

    <n-modal v-model:show="spaceModalVisible" preset="card" :title="editingSpace ? '编辑空间' : '新建空间'" style="width: min(520px, 92vw)">
      <n-form ref="spaceFormRef" :model="spaceForm" :rules="spaceRules" label-placement="top">
        <n-form-item label="名称" path="name">
          <n-input v-model:value="spaceForm.name" placeholder="例如：3F 会议室 A" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="spaceForm.description" type="textarea" placeholder="空间用途、开放说明" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi label="容量" path="capacity">
            <n-input-number v-model:value="spaceForm.capacity" :min="1" style="width: 100%" />
          </n-form-item-gi>
          <n-form-item-gi label="位置" path="location">
            <n-input v-model:value="spaceForm.location" placeholder="楼层或地点" />
          </n-form-item-gi>
        </n-grid>
        <n-form-item label="设施" path="facilities">
          <n-input v-model:value="spaceForm.facilities" placeholder="投影仪, 白板, 视频会议" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="spaceModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="savingSpace" @click="saveSpace">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="reservationModalVisible" preset="card" :title="`预约 ${selectedSpace?.name || ''}`" style="width: min(520px, 92vw)">
      <n-form ref="reservationFormRef" :model="reservationForm" :rules="reservationRules" label-placement="top">
        <n-form-item label="开始时间" path="startTime">
          <n-date-picker v-model:formatted-value="reservationForm.startTime" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" clearable style="width: 100%" />
        </n-form-item>
        <n-form-item label="结束时间" path="endTime">
          <n-date-picker v-model:formatted-value="reservationForm.endTime" type="datetime" value-format="yyyy-MM-dd'T'HH:mm:ss" clearable style="width: 100%" />
        </n-form-item>
        <n-form-item label="用途" path="purpose">
          <n-input v-model:value="reservationForm.purpose" type="textarea" placeholder="会议、活动或使用说明" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="reservationModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="savingReservation" @click="saveReservation">提交预约</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="scheduleVisible" preset="card" :title="`${selectedSpace?.name || ''} 的预约时段`" style="width: min(760px, 94vw)">
      <n-data-table :columns="scheduleColumns" :data="spaceReservations" :loading="scheduleLoading" :bordered="false" />
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NTag, useMessage, type DataTableColumns, type FormInst, type FormRules } from 'naive-ui';
import { CalendarPlus, Clock3, Pencil, Plus, Power, Search } from '@lucide/vue';
import { errorMessage } from '@/api/http';
import { reservationsApi } from '@/api/reservations';
import { spacesApi } from '@/api/spaces';
import type { Reservation, ReservationRequest, Space, SpaceRequest } from '@/api/types';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const message = useMessage();
const loading = ref(false);
const savingSpace = ref(false);
const savingReservation = ref(false);
const scheduleLoading = ref(false);
const spaces = ref<Space[]>([]);
const keyword = ref('');
const statusFilter = ref('ALL');
const spaceModalVisible = ref(false);
const reservationModalVisible = ref(false);
const scheduleVisible = ref(false);
const editingSpace = ref<Space | null>(null);
const selectedSpace = ref<Space | null>(null);
const spaceReservations = ref<Reservation[]>([]);
const spaceFormRef = ref<FormInst | null>(null);
const reservationFormRef = ref<FormInst | null>(null);

const statusOptions = [
  { label: '全部', value: 'ALL' },
  { label: '可用', value: 'AVAILABLE' },
  { label: '停用', value: 'UNAVAILABLE' }
];

const spaceForm = reactive<SpaceRequest>({
  name: '',
  description: '',
  capacity: 1,
  location: '',
  facilities: ''
});

const reservationForm = reactive<ReservationRequest>({
  spaceId: 0,
  startTime: '',
  endTime: '',
  purpose: ''
});

const spaceRules: FormRules = {
  name: [{ required: true, message: '请输入空间名称', trigger: ['input', 'blur'] }],
  capacity: [{ required: true, type: 'number', min: 1, message: '容量至少为 1', trigger: ['input', 'blur'] }]
};

const reservationRules: FormRules = {
  startTime: [{ required: true, message: '请选择开始时间', trigger: ['change', 'blur'] }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: ['change', 'blur'] }]
};

const availableCount = computed(() => spaces.value.filter((space) => space.status === 'AVAILABLE').length);
const maxCapacity = computed(() => Math.max(0, ...spaces.value.map((space) => space.capacity)));
const filteredSpaces = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  return spaces.value.filter((space) => {
    const text = [space.name, space.location, space.facilities, space.description].join(' ').toLowerCase();
    const statusMatches = statusFilter.value === 'ALL' || space.status === statusFilter.value;
    return statusMatches && (!query || text.includes(query));
  });
});

const scheduleColumns: DataTableColumns<Reservation> = [
  { title: '预约人', key: 'userName' },
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
  }
];

function formatDate(value: string) {
  return value ? value.replace('T', ' ').slice(0, 16) : '-';
}

async function loadSpaces() {
  loading.value = true;
  try {
    spaces.value = await spacesApi.list();
  } catch (error) {
    message.error(errorMessage(error, '空间加载失败'));
  } finally {
    loading.value = false;
  }
}

function openSpaceForm(space?: Space) {
  editingSpace.value = space || null;
  Object.assign(spaceForm, {
    name: space?.name || '',
    description: space?.description || '',
    capacity: space?.capacity || 1,
    location: space?.location || '',
    facilities: space?.facilities || ''
  });
  spaceModalVisible.value = true;
}

async function saveSpace() {
  await spaceFormRef.value?.validate();
  savingSpace.value = true;
  try {
    if (editingSpace.value) {
      await spacesApi.update(editingSpace.value.id, spaceForm);
      message.success('空间已更新');
    } else {
      await spacesApi.create(spaceForm);
      message.success('空间已创建');
    }
    spaceModalVisible.value = false;
    await loadSpaces();
  } catch (error) {
    message.error(errorMessage(error, '保存失败'));
  } finally {
    savingSpace.value = false;
  }
}

async function toggleStatus(space: Space) {
  try {
    await spacesApi.updateStatus(space.id, space.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE');
    message.success('状态已更新');
    await loadSpaces();
  } catch (error) {
    message.error(errorMessage(error, '状态更新失败'));
  }
}

function openReservation(space: Space) {
  selectedSpace.value = space;
  Object.assign(reservationForm, {
    spaceId: space.id,
    startTime: '',
    endTime: '',
    purpose: ''
  });
  reservationModalVisible.value = true;
}

async function saveReservation() {
  await reservationFormRef.value?.validate();
  if (reservationForm.endTime <= reservationForm.startTime) {
    message.warning('结束时间必须晚于开始时间');
    return;
  }

  savingReservation.value = true;
  try {
    await reservationsApi.create(reservationForm);
    message.success('预约已提交');
    reservationModalVisible.value = false;
  } catch (error) {
    message.error(errorMessage(error, '预约失败'));
  } finally {
    savingReservation.value = false;
  }
}

async function openSchedule(space: Space) {
  selectedSpace.value = space;
  scheduleVisible.value = true;
  scheduleLoading.value = true;
  try {
    spaceReservations.value = await reservationsApi.bySpace(space.id);
  } catch (error) {
    message.error(errorMessage(error, '预约时段加载失败'));
  } finally {
    scheduleLoading.value = false;
  }
}

onMounted(loadSpaces);
</script>
