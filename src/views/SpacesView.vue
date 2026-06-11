<template>
  <section>
    <!-- 브레드크럼 -->
    <n-breadcrumb style="margin-bottom: 20px">
      <n-breadcrumb-item @click="router.push({ name: 'buildings' })" style="cursor:pointer">
        캠퍼스 공간 예약
      </n-breadcrumb-item>
      <n-breadcrumb-item
        v-if="building"
        @click="router.push({ name: 'building-detail', params: { buildingId } })"
        style="cursor:pointer"
      >
        {{ building.name }}
      </n-breadcrumb-item>
      <n-breadcrumb-item>{{ spaceTypeLabel(spaceTypeParam) }}</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-head">
      <div>
        <h2 class="page-title">
          {{ building ? `${building.name} · ` : '' }}{{ spaceTypeLabel(spaceTypeParam) }}
        </h2>
        <p class="page-subtitle">
          예약 가능 시간 <strong>오전 9시 ~ 오후 9시</strong> · 1회 최대 <strong>2시간</strong>
        </p>
      </div>
      <n-button v-if="auth.isAdmin" type="primary" @click="openSpaceForm()">
        <template #icon><n-icon :component="Plus" /></template>
        새 공간 만들기
      </n-button>
    </div>

    <!-- 통계 -->
    <div class="metric-grid">
      <n-card size="small">
        <n-statistic label="총 공간 수" :value="filteredSpaces.length" />
      </n-card>
      <n-card size="small">
        <n-statistic label="사용 가능" :value="availableCount" />
      </n-card>
      <n-card size="small">
        <n-statistic label="최대 수용 인원" :value="maxCapacity" />
      </n-card>
    </div>

    <!-- 검색 -->
    <div class="toolbar">
      <n-input v-model:value="keyword" clearable placeholder="공간명, 위치, 시설 검색">
        <template #prefix><n-icon :component="Search" /></template>
      </n-input>
    </div>

    <!-- 공간 목록 -->
    <n-spin :show="loading">
      <n-empty v-if="!displayedSpaces.length" description="일치하는 공간이 없습니다" />
      <div v-else class="space-grid">
        <n-card v-for="space in displayedSpaces" :key="space.id" class="space-card" :bordered="false">
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
                <template #icon><n-icon :component="CalendarPlus" /></template>
                예약
              </n-button>
              <n-button secondary @click="openSchedule(space)">
                <template #icon><n-icon :component="Clock3" /></template>
                시간대
              </n-button>
              <template v-if="auth.isAdmin">
                <n-button secondary @click="openSpaceForm(space)">
                  <template #icon><n-icon :component="Pencil" /></template>
                  편집
                </n-button>
                <n-button secondary @click="toggleStatus(space)">
                  <template #icon><n-icon :component="Power" /></template>
                  {{ space.status === 'AVAILABLE' ? '사용 중지' : '사용' }}
                </n-button>
              </template>
            </div>
          </n-space>
        </n-card>
      </div>
    </n-spin>

    <!-- 공간 생성/편집 모달 -->
    <n-modal v-model:show="spaceModalVisible" preset="card" :title="editingSpace ? '공간 편집' : '새 공간 만들기'" style="width: min(540px, 92vw)">
      <n-form ref="spaceFormRef" :model="spaceForm" :rules="spaceRules" label-placement="top">
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi label="건물" path="building">
            <n-select v-model:value="spaceForm.building" :options="buildingSelectOptions" placeholder="건물 선택" />
          </n-form-item-gi>
          <n-form-item-gi label="공간 유형" path="spaceType">
            <n-select v-model:value="spaceForm.spaceType" :options="spaceTypeSelectOptions" placeholder="유형 선택" />
          </n-form-item-gi>
        </n-grid>
        <n-form-item label="이름" path="name">
          <n-input v-model:value="spaceForm.name" placeholder="예: 공학관 3층 회의실 A" />
        </n-form-item>
        <n-form-item label="설명" path="description">
          <n-input v-model:value="spaceForm.description" type="textarea" placeholder="공간 용도, 개방 안내" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi label="수용 인원" path="capacity">
            <n-input-number v-model:value="spaceForm.capacity" :min="1" style="width:100%" />
          </n-form-item-gi>
          <n-form-item-gi label="위치 (층/호실)" path="location">
            <n-input v-model:value="spaceForm.location" placeholder="예: 3층 301호" />
          </n-form-item-gi>
        </n-grid>
        <n-form-item label="시설" path="facilityIds">
          <n-select
            v-model:value="spaceForm.facilityIds"
            multiple
            filterable
            tag
            :options="facilityOptions"
            placeholder="시설을 선택하거나 입력 후 Enter"
            @create="onCreateFacility"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="spaceModalVisible = false">취소</n-button>
          <n-button type="primary" :loading="savingSpace" @click="saveSpace">저장</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 예약 모달 -->
    <n-modal v-model:show="reservationModalVisible" preset="card" :title="`${selectedSpace?.name || ''} 예약`" style="width: min(520px, 92vw)">
      <n-alert type="info" :show-icon="true" style="margin-bottom:16px">
        예약 가능 시간: <strong>오전 9:00 ~ 오후 9:00</strong> &nbsp;|&nbsp; 최대: <strong>2시간</strong>
      </n-alert>
      <n-form ref="reservationFormRef" :model="reservationFormModel" :rules="reservationRules" label-placement="top">
        <n-form-item label="시작 시간" path="startDateTime">
          <n-date-picker
            v-model:value="reservationFormModel.startDateTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            placeholder="시작 시간을 선택하세요"
            :is-date-disabled="isDateDisabled"
            :is-time-disabled="isStartTimeDisabled"
            style="width:100%"
          />
        </n-form-item>
        <n-form-item label="종료 시간" path="endDateTime">
          <n-date-picker
            v-model:value="reservationFormModel.endDateTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            placeholder="종료 시간을 선택하세요"
            :is-date-disabled="isDateDisabled"
            :is-time-disabled="isEndTimeDisabled"
            style="width:100%"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="reservationModalVisible = false">취소</n-button>
          <n-button type="primary" :loading="savingReservation" @click="saveReservation">예약 제출</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 예약 시간대 모달 -->
    <n-modal v-model:show="scheduleVisible" preset="card" :title="`${selectedSpace?.name || ''} 예약 시간대`" style="width: min(760px, 94vw)">
      <n-data-table :columns="scheduleColumns" :data="spaceReservations" :loading="scheduleLoading" :bordered="false" />
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NTag, useMessage, type DataTableColumns, type FormInst, type FormRules } from 'naive-ui'
import { CalendarPlus, Clock3, Pencil, Plus, Power, Search } from '@lucide/vue'
import { errorMessage } from '@/api/http'
import { reservationsApi } from '@/api/reservations'
import { spacesApi } from '@/api/spaces'
import { facilitiesApi } from '@/api/facilities'
import type { FacilityResponse, Reservation, ReservationRequest, Space, SpaceRequest, SpaceType } from '@/api/types'
import { useAuthStore } from '@/stores/auth'
import { CAMPUS_BUILDINGS, getBuildingById } from '@/config/buildings'

const auth = useAuthStore()
const message = useMessage()
const route = useRoute()
const router = useRouter()

// 라우트 파라미터에서 건물·유형 추출
const buildingId = route.params.buildingId as string | undefined
const spaceTypeParam = route.params.spaceType as SpaceType | undefined
const building = buildingId ? getBuildingById(buildingId) : undefined

// ── 상태 ───────────────────────────────────────────────
const loading = ref(false)
const savingSpace = ref(false)
const savingReservation = ref(false)
const scheduleLoading = ref(false)
const spaces = ref<Space[]>([])
const keyword = ref('')
const spaceModalVisible = ref(false)
const reservationModalVisible = ref(false)
const scheduleVisible = ref(false)
const editingSpace = ref<Space | null>(null)
const selectedSpace = ref<Space | null>(null)
const spaceReservations = ref<Reservation[]>([])
const spaceFormRef = ref<FormInst | null>(null)
const reservationFormRef = ref<FormInst | null>(null)

// ── 운영 시간 상수 ─────────────────────────────────────
const OPEN_HOUR = 9
const CLOSE_HOUR = 21
const MAX_DURATION_MS = 2 * 60 * 60 * 1000

// ── 셀렉트 옵션 ────────────────────────────────────────
const buildingSelectOptions = CAMPUS_BUILDINGS.map((b) => ({ label: b.name, value: b.id }))
const spaceTypeSelectOptions = [
  { label: '소형 회의실', value: 'MEETING_ROOM' },
  { label: '개인 좌석', value: 'INDIVIDUAL_SEAT' }
]

// ── 공간 유형 레이블 ───────────────────────────────────
function spaceTypeLabel(type?: SpaceType | string | null) {
  if (type === 'MEETING_ROOM') return '소형 회의실'
  if (type === 'INDIVIDUAL_SEAT') return '개인 좌석'
  return '전체 공간'
}

// ── 폼 상태 ────────────────────────────────────────────
const spaceForm = reactive<SpaceRequest>({
  name: '',
  description: '',
  capacity: 1,
  location: '',
  facilities: '',
  facilityIds: [],
  spaceType: spaceTypeParam,
  building: buildingId
})

// 관리자 시설 목록 (백엔드: GET /api/admin/facilities)
const facilities = ref<FacilityResponse[]>([])
const facilityOptions = computed(() =>
  facilities.value.map((f) => ({ label: f.name, value: f.id }))
)

async function loadFacilities() {
  if (!auth.isAdmin) return
  try {
    facilities.value = await facilitiesApi.list()
  } catch (error) {
    // 시설 목록은 선택 사항 — 실패해도 폼은 동작
    console.warn('facilities load failed', error)
  }
}

async function onCreateFacility(name: string) {
  if (!auth.isAdmin) return
  try {
    const created = await facilitiesApi.create(name)
    facilities.value = [...facilities.value, created]
    const ids = spaceForm.facilityIds || []
    if (!ids.includes(created.id)) spaceForm.facilityIds = [...ids, created.id]
  } catch (error) {
    message.error(errorMessage(error, '시설 생성 실패'))
  }
}

const reservationForm = reactive<ReservationRequest>({
  spaceId: 0,
  startTime: '',
  endTime: '',
  purpose: ''
})

const reservationFormModel = reactive({
  startDateTime: null as number | null,
  endDateTime: null as number | null,
  purpose: ''
})

// ── 날짜·시간 제한 ─────────────────────────────────────
function isDateDisabled(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return d < now
}

function isStartTimeDisabled(_ts: number) {
  return { isHourDisabled: (h: number) => h < OPEN_HOUR || h >= CLOSE_HOUR }
}

function isEndTimeDisabled(_ts: number) {
  return {
    isHourDisabled: (h: number) => h < OPEN_HOUR || h > CLOSE_HOUR,
    isMinuteDisabled: (m: number, h: number | null) => h === CLOSE_HOUR && m > 0
  }
}

// ── 유효성 검사 규칙 ───────────────────────────────────
const spaceRules: FormRules = {
  building: [{ required: true, message: '건물을 선택하세요', trigger: ['change', 'blur'] }],
  spaceType: [{ required: true, message: '공간 유형을 선택하세요', trigger: ['change', 'blur'] }],
  name: [{ required: true, message: '공간 이름을 입력하세요', trigger: ['input', 'blur'] }],
  capacity: [{ required: true, type: 'number', min: 1, message: '수용 인원은 최소 1명', trigger: ['input', 'blur'] }]
}

const reservationRules: FormRules = {
  startDateTime: [{ required: true, type: 'number', message: '시작 시간을 선택하세요', trigger: ['change'] }],
  endDateTime: [{ required: true, type: 'number', message: '종료 시간을 선택하세요', trigger: ['change'] }]
}

// ── 계산 속성 ──────────────────────────────────────────
// 건물·유형 필터링
const filteredSpaces = computed(() => {
  return spaces.value.filter((s) => {
    const matchBuilding = !buildingId || s.building === buildingId
    const matchType = !spaceTypeParam || s.spaceType === spaceTypeParam
    return matchBuilding && matchType
  })
})

// 키워드 검색
const displayedSpaces = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return filteredSpaces.value
  return filteredSpaces.value.filter((s) =>
    [s.name, s.location, s.facilities, s.description].join(' ').toLowerCase().includes(q)
  )
})

const availableCount = computed(() => filteredSpaces.value.filter((s) => s.status === 'AVAILABLE').length)
const maxCapacity = computed(() => Math.max(0, ...filteredSpaces.value.map((s) => s.capacity)))

// ── 예약 시간대 테이블 ─────────────────────────────────
const scheduleColumns: DataTableColumns<Reservation> = [
  { title: '예약자', key: 'userName' },
  { title: '시작', key: 'startTime', render: (row) => formatDate(row.startTime) },
  { title: '종료', key: 'endTime', render: (row) => formatDate(row.endTime) },
  {
    title: '상태',
    key: 'status',
    render: (row) =>
      h(NTag, { type: row.status === 'CONFIRMED' ? 'success' : 'default', bordered: false },
        { default: () => (row.status === 'CONFIRMED' ? '점유 중' : '취소됨') })
  }
]

// ── 유틸 ──────────────────────────────────────────────
function formatDate(v: string) { return v ? v.replace('T', ' ').slice(0, 16) : '-' }

function formatDateTimeLocal(date: Date) {
  const p = (v: number) => String(v).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`
}

function normalizeDateTime(v: string) { return v.length === 16 ? `${v}:00` : v }

function nextReservationWindow() {
  const start = new Date()
  start.setSeconds(0, 0)
  start.setMinutes(start.getMinutes() + 30)
  if (start.getHours() < OPEN_HOUR) start.setHours(OPEN_HOUR, 0, 0, 0)
  else if (start.getHours() >= CLOSE_HOUR) {
    start.setDate(start.getDate() + 1)
    start.setHours(OPEN_HOUR, 0, 0, 0)
  }
  const end = new Date(start)
  end.setHours(end.getHours() + 1)
  if (end.getHours() > CLOSE_HOUR || (end.getHours() === CLOSE_HOUR && end.getMinutes() > 0))
    end.setHours(CLOSE_HOUR, 0, 0, 0)
  return { startTime: formatDateTimeLocal(start), endTime: formatDateTimeLocal(end) }
}

// ── API 연동 ──────────────────────────────────────────
async function loadSpaces() {
  loading.value = true
  try { spaces.value = await spacesApi.list() }
  catch (error) { message.error(errorMessage(error, '공간 로드 실패')) }
  finally { loading.value = false }
}

function openSpaceForm(space?: Space) {
  editingSpace.value = space || null
  Object.assign(spaceForm, {
    name: space?.name || '',
    description: space?.description || '',
    capacity: space?.capacity || 1,
    location: space?.location || '',
    facilities: space?.facilities || '',
    facilityIds: space?.facilityIds ? [...space.facilityIds] : [],
    spaceType: space?.spaceType || spaceTypeParam || undefined,
    building: space?.building || buildingId || undefined
  })
  loadFacilities()
  spaceModalVisible.value = true
}

async function saveSpace() {
  await spaceFormRef.value?.validate()
  savingSpace.value = true
  try {
    if (editingSpace.value) {
      await spacesApi.update(editingSpace.value.id, spaceForm)
      message.success('공간이 업데이트되었습니다')
    } else {
      await spacesApi.create(spaceForm)
      message.success('공간이 생성되었습니다')
    }
    spaceModalVisible.value = false
    await loadSpaces()
  } catch (error) {
    message.error(errorMessage(error, '저장 실패'))
  } finally {
    savingSpace.value = false
  }
}

async function toggleStatus(space: Space) {
  try {
    await spacesApi.updateStatus(space.id, space.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE')
    message.success('상태가 업데이트되었습니다')
    await loadSpaces()
  } catch (error) {
    message.error(errorMessage(error, '상태 업데이트 실패'))
  }
}

function openReservation(space: Space) {
  selectedSpace.value = space
  const w = nextReservationWindow()
  reservationForm.spaceId = space.id
  reservationFormModel.purpose = ''
  reservationFormModel.startDateTime = new Date(w.startTime).getTime()
  reservationFormModel.endDateTime = new Date(w.endTime).getTime()
  reservationModalVisible.value = true
}

async function saveReservation() {
  await reservationFormRef.value?.validate()
  const startTs = reservationFormModel.startDateTime
  const endTs = reservationFormModel.endDateTime
  if (!startTs || !endTs) { message.warning('시작/종료 시간을 선택하세요'); return }
  if (endTs <= startTs) { message.warning('종료 시간은 시작 시간보다 늦어야 합니다'); return }

  const sd = new Date(startTs)
  const ed = new Date(endTs)
  if (sd.getHours() < OPEN_HOUR || sd.getHours() >= CLOSE_HOUR) {
    message.warning('시작 시간은 오전 9시 ~ 오후 9시 사이여야 합니다'); return
  }
  if (ed.getHours() > CLOSE_HOUR || (ed.getHours() === CLOSE_HOUR && ed.getMinutes() > 0)) {
    message.warning('종료 시간은 오후 9시(21:00)를 초과할 수 없습니다'); return
  }
  if (endTs - startTs > MAX_DURATION_MS) {
    message.warning('1회 최대 예약 시간은 2시간입니다'); return
  }

  const payload: ReservationRequest = {
    spaceId: reservationForm.spaceId,
    startTime: normalizeDateTime(formatDateTimeLocal(sd)),
    endTime: normalizeDateTime(formatDateTimeLocal(ed))
  }
  savingReservation.value = true
  try {
    await reservationsApi.create(payload)
    message.success('예약이 제출되었습니다')
    reservationModalVisible.value = false
  } catch (error) {
    message.error(errorMessage(error, '예약 실패'))
  } finally {
    savingReservation.value = false
  }
}

async function openSchedule(space: Space) {
  selectedSpace.value = space
  scheduleVisible.value = true
  scheduleLoading.value = true
  try { spaceReservations.value = await reservationsApi.bySpace(space.id) }
  catch (error) { message.error(errorMessage(error, '예약 시간대 로드 실패')) }
  finally { scheduleLoading.value = false }
}

onMounted(loadSpaces)
</script>
