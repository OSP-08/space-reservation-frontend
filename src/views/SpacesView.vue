<template>
  <section>
    <div class="page-head">
      <div>
        <h2 class="page-title">공간</h2>
        <p class="page-subtitle">예약 가능한 공간을 확인하고 관리자는 공간 정보와 사용 가능 여부를 유지 관리할 수 있습니다.</p>
      </div>
      <n-button v-if="auth.isAdmin" type="primary" @click="openSpaceForm()">
        <template #icon>
          <n-icon :component="Plus" />
        </template>
        새 공간 만들기
      </n-button>
    </div>

    <div class="metric-grid">
      <n-card size="small">
        <n-statistic label="총 공간 수" :value="spaces.length" />
      </n-card>
      <n-card size="small">
        <n-statistic label="사용 가능" :value="availableCount" />
      </n-card>
      <n-card size="small">
        <n-statistic label="최대 수용 인원" :value="maxCapacity" />
      </n-card>
    </div>

    <div class="toolbar">
      <n-input v-model:value="keyword" clearable placeholder="공간, 위치 또는 시설 검색">
        <template #prefix>
          <n-icon :component="Search" />
        </template>
      </n-input>
      <n-segmented v-model:value="statusFilter" :options="statusOptions" />
    </div>

    <n-spin :show="loading">
      <n-empty v-if="!filteredSpaces.length" description="일치하는 공간이 없습니다" />
      <div v-else class="space-grid">
        <n-card v-for="space in filteredSpaces" :key="space.id" class="space-card" :bordered="false">
          <div class="space-card__top">
            <div>
              <n-space align="center" :size="8">
                <h3 style="margin: 0">{{ space.name }}</h3>
                <n-tag :type="space.status === 'AVAILABLE' ? 'success' : 'warning'" size="small">
                  {{ space.status === 'AVAILABLE' ? '사용 가능' : '사용 중지' }}
                </n-tag>
              </n-space>
              <p class="muted">{{ space.location || '위치 미입력' }}</p>
            </div>
            <n-tag :bordered="false">{{ space.capacity }}명</n-tag>
          </div>

          <n-ellipsis :line-clamp="2" class="muted">
            {{ space.description || '설명 없음' }}
          </n-ellipsis>

          <n-divider />

          <n-space vertical :size="10">
            <n-text depth="3">시설: {{ space.facilities || '미입력' }}</n-text>
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
                예약
              </n-button>
              <n-button secondary @click="openSchedule(space)">
                <template #icon>
                  <n-icon :component="Clock3" />
                </template>
                시간대
              </n-button>
              <template v-if="auth.isAdmin">
                <n-button secondary @click="openSpaceForm(space)">
                  <template #icon>
                    <n-icon :component="Pencil" />
                  </template>
                  편집
                </n-button>
                <n-button secondary @click="toggleStatus(space)">
                  <template #icon>
                    <n-icon :component="Power" />
                  </template>
                  {{ space.status === 'AVAILABLE' ? '사용 중지' : '사용' }}
                </n-button>
              </template>
            </div>
          </n-space>
        </n-card>
      </div>
    </n-spin>

    <n-modal v-model:show="spaceModalVisible" preset="card" :title="editingSpace ? '공간 편집' : '새 공간 만들기'" style="width: min(520px, 92vw)">
      <n-form ref="spaceFormRef" :model="spaceForm" :rules="spaceRules" label-placement="top">
        <n-form-item label="이름" path="name">
          <n-input v-model:value="spaceForm.name" placeholder="예: 3층 회의실 A" />
        </n-form-item>
        <n-form-item label="설명" path="description">
          <n-input v-model:value="spaceForm.description" type="textarea" placeholder="공간 용도, 개방 안내" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi label="수용 인원" path="capacity">
            <n-input-number v-model:value="spaceForm.capacity" :min="1" style="width: 100%" />
          </n-form-item-gi>
          <n-form-item-gi label="위치" path="location">
            <n-input v-model:value="spaceForm.location" placeholder="층 또는 장소" />
          </n-form-item-gi>
        </n-grid>
        <n-form-item label="시설" path="facilities">
          <n-input v-model:value="spaceForm.facilities" placeholder="프로젝터, 화이트보드, 화상 회의" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="spaceModalVisible = false">취소</n-button>
          <n-button type="primary" :loading="savingSpace" @click="saveSpace">저장</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="reservationModalVisible" preset="card" :title="`${selectedSpace?.name || ''} 예약`" style="width: min(520px, 92vw)">
      <n-form ref="reservationFormRef" :model="reservationFormModel" :rules="reservationRules" label-placement="top">
        <n-form-item label="시작 시간" path="startDateTime">
          <n-date-picker
            v-model:value="reservationFormModel.startDateTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            placeholder="시작 시간을 선택하세요"
            :is-date-disabled="isDateDisabled"
            class="datetime-picker"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="종료 시간" path="endDateTime">
          <n-date-picker
            v-model:value="reservationFormModel.endDateTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            placeholder="종료 시간을 선택하세요"
            :is-date-disabled="isDateDisabled"
            class="datetime-picker"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="용도" path="purpose">
          <n-input v-model:value="reservationFormModel.purpose" type="textarea" placeholder="회의, 활동 또는 사용 설명" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="reservationModalVisible = false">취소</n-button>
          <n-button type="primary" :loading="savingReservation" @click="saveReservation">예약 제출</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="scheduleVisible" preset="card" :title="`${selectedSpace?.name || ''} 예약 시간대`" style="width: min(760px, 94vw)">
      <n-data-table :columns="scheduleColumns" :data="spaceReservations" :loading="scheduleLoading" :bordered="false" />
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NTag, NDatePicker, useMessage, type DataTableColumns, type FormInst, type FormRules } from 'naive-ui';
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
  { label: '전체', value: 'ALL' },
  { label: '사용 가능', value: 'AVAILABLE' },
  { label: '사용 중지', value: 'UNAVAILABLE' }
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

const reservationFormModel = reactive({
  startDateTime: null as number | null,
  endDateTime: null as number | null,
  purpose: ''
});

function isDateDisabled(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date < now;
}

const spaceRules: FormRules = {
  name: [{ required: true, message: '공간 이름을 입력하세요', trigger: ['input', 'blur'] }],
  capacity: [{ required: true, type: 'number', min: 1, message: '수용 인원은 최소 1명 이상이어야 합니다', trigger: ['input', 'blur'] }]
};

const reservationRules: FormRules = {
  startDateTime: [{ required: true, type: 'number', message: '시작 시간을 선택하세요', trigger: ['change'] }],
  endDateTime: [{ required: true, type: 'number', message: '종료 시간을 선택하세요', trigger: ['change'] }]
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
  { title: '예약자', key: 'userName' },
  { title: '시작', key: 'startTime', render: (row) => formatDate(row.startTime) },
  { title: '종료', key: 'endTime', render: (row) => formatDate(row.endTime) },
  { title: '용도', key: 'purpose' },
  {
    title: '상태',
    key: 'status',
    render: (row) =>
      h(
        NTag,
        { type: row.status === 'CONFIRMED' ? 'success' : 'default', bordered: false },
        { default: () => (row.status === 'CONFIRMED' ? '확인됨' : '취소됨') }
      )
  }
];

function formatDate(value: string) {
  return value ? value.replace('T', ' ').slice(0, 16) : '-';
}

function formatDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function nextReservationWindow() {
  const start = new Date();
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 30);

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    startTime: formatDateTimeLocal(start),
    endTime: formatDateTimeLocal(end)
  };
}

function normalizeDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

async function loadSpaces() {
  loading.value = true;
  try {
    spaces.value = await spacesApi.list();
  } catch (error) {
    message.error(errorMessage(error, '공간 로드 실패'));
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
      message.success('공간이 업데이트되었습니다');
    } else {
      await spacesApi.create(spaceForm);
      message.success('공간이 생성되었습니다');
    }
    spaceModalVisible.value = false;
    await loadSpaces();
  } catch (error) {
    message.error(errorMessage(error, '저장 실패'));
  } finally {
    savingSpace.value = false;
  }
}

async function toggleStatus(space: Space) {
  try {
    await spacesApi.updateStatus(space.id, space.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE');
    message.success('상태가 업데이트되었습니다');
    await loadSpaces();
  } catch (error) {
    message.error(errorMessage(error, '상태 업데이트 실패'));
  }
}

function openReservation(space: Space) {
  selectedSpace.value = space;
  const reservationWindow = nextReservationWindow();
  reservationForm.spaceId = space.id;
  reservationFormModel.purpose = '';
  reservationFormModel.startDateTime = new Date(reservationWindow.startTime).getTime();
  reservationFormModel.endDateTime = new Date(reservationWindow.endTime).getTime();
  reservationModalVisible.value = true;
}

async function saveReservation() {
  await reservationFormRef.value?.validate();

  if (!reservationFormModel.startDateTime || !reservationFormModel.endDateTime) {
    message.warning('시작 시간과 종료 시간을 선택하세요');
    return;
  }

  if (reservationFormModel.endDateTime <= reservationFormModel.startDateTime) {
    message.warning('종료 시간은 시작 시간보다 늦어야 합니다');
    return;
  }

  const payload: ReservationRequest = {
    spaceId: reservationForm.spaceId,
    startTime: formatDateTimeLocal(new Date(reservationFormModel.startDateTime)),
    endTime: formatDateTimeLocal(new Date(reservationFormModel.endDateTime)),
    purpose: reservationFormModel.purpose
  };

  savingReservation.value = true;
  try {
    await reservationsApi.create({
      ...payload,
      startTime: normalizeDateTime(payload.startTime),
      endTime: normalizeDateTime(payload.endTime)
    });
    message.success('예약이 제출되었습니다');
    reservationModalVisible.value = false;
  } catch (error) {
    message.error(errorMessage(error, '예약 실패'));
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
    message.error(errorMessage(error, '예약 시간대 로드 실패'));
  } finally {
    scheduleLoading.value = false;
  }
}

onMounted(loadSpaces);
</script>