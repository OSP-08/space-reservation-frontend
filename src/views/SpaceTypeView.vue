<template>
  <section>
    <!-- 브레드크럼 -->
    <n-breadcrumb style="margin-bottom: 20px">
      <n-breadcrumb-item @click="router.push({ name: 'buildings' })" style="cursor:pointer">
        캠퍼스 공간 예약
      </n-breadcrumb-item>
      <n-breadcrumb-item>{{ building?.name }}</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="page-head">
      <div>
        <h2 class="page-title">{{ building?.name }}</h2>
        <p class="page-subtitle">{{ building?.description }}</p>
      </div>
    </div>

    <n-spin :show="loading">
      <p class="section-label">예약할 공간 유형을 선택하세요</p>
      <div class="type-grid">

        <!-- 소형 회의실 카드 -->
        <div
          class="type-card"
          :class="{ 'type-card--disabled': meetingCount === 0 }"
          @click="meetingCount > 0 && goToSpaces('MEETING_ROOM')"
        >
          <div class="type-card__icon type-card__icon--meeting">
            <n-icon :component="Users" size="40" color="#fff" />
          </div>
          <h3>소형 회의실</h3>
          <p class="muted">팀 미팅, 스터디 그룹, 세미나 등 다인 이용 가능한 회의실입니다.</p>
          <n-divider style="margin: 16px 0" />
          <n-space justify="space-between" align="center">
            <n-tag type="success" :bordered="false">
              사용 가능 {{ meetingAvailable }}
            </n-tag>
            <n-text depth="3" style="font-size:13px">전체 {{ meetingCount }}개</n-text>
          </n-space>
          <div v-if="meetingCount === 0" class="type-card__empty">현재 이용 가능한 회의실이 없습니다</div>
        </div>

        <!-- 개인 좌석 카드 -->
        <div
          class="type-card"
          :class="{ 'type-card--disabled': seatCount === 0 }"
          @click="seatCount > 0 && goToSpaces('INDIVIDUAL_SEAT')"
        >
          <div class="type-card__icon type-card__icon--seat">
            <n-icon :component="UserRound" size="40" color="#fff" />
          </div>
          <h3>개인 좌석</h3>
          <p class="muted">집중 학습, 개인 과제 등 혼자 사용하는 독립 좌석입니다.</p>
          <n-divider style="margin: 16px 0" />
          <n-space justify="space-between" align="center">
            <n-tag type="success" :bordered="false">
              사용 가능 {{ seatAvailable }}
            </n-tag>
            <n-text depth="3" style="font-size:13px">전체 {{ seatCount }}개</n-text>
          </n-space>
          <div v-if="seatCount === 0" class="type-card__empty">현재 이용 가능한 좌석이 없습니다</div>
        </div>

      </div>
    </n-spin>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { Users, UserRound } from '@lucide/vue'
import { spacesApi } from '@/api/spaces'
import { errorMessage } from '@/api/http'
import type { Space } from '@/api/types'
import { getBuildingById } from '@/config/buildings'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const buildingId = route.params.buildingId as string
const building = getBuildingById(buildingId)

const loading = ref(false)
const spaces = ref<Space[]>([])

const buildingSpaces = computed(() => spaces.value.filter((s) => s.building === buildingId))
const meetingSpaces = computed(() => buildingSpaces.value.filter((s) => s.spaceType === 'MEETING_ROOM'))
const seatSpaces = computed(() => buildingSpaces.value.filter((s) => s.spaceType === 'INDIVIDUAL_SEAT'))

const meetingCount = computed(() => meetingSpaces.value.length)
const seatCount = computed(() => seatSpaces.value.length)
const meetingAvailable = computed(() => meetingSpaces.value.filter((s) => s.status === 'AVAILABLE').length)
const seatAvailable = computed(() => seatSpaces.value.filter((s) => s.status === 'AVAILABLE').length)

function goToSpaces(spaceType: string) {
  router.push({ name: 'spaces', params: { buildingId, spaceType } })
}

async function loadSpaces() {
  loading.value = true
  try {
    spaces.value = await spacesApi.list()
  } catch (error) {
    message.error(errorMessage(error, '공간 정보를 불러오지 못했습니다'))
  } finally {
    loading.value = false
  }
}

onMounted(loadSpaces)
</script>

<style scoped>
.section-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.type-card {
  padding: 28px 24px;
  background: #fff;
  border-radius: 14px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  position: relative;
}

.type-card:hover:not(.type-card--disabled) {
  border-color: #0f766e;
  box-shadow: 0 6px 24px rgba(15, 118, 110, 0.12);
  transform: translateY(-3px);
}

.type-card--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-card__icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.type-card__icon--meeting {
  background: #0f766e;
}

.type-card__icon--seat {
  background: #2563eb;
}

.type-card h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
}

.type-card .muted {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

.type-card__empty {
  margin-top: 12px;
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
}
</style>
