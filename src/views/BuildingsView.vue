<template>
  <section>
    <div class="page-head">
      <div>
        <h2 class="page-title">캠퍼스 공간 예약</h2>
        <p class="page-subtitle">
          예약할 건물을 선택하세요. 예약 가능 시간은 <strong>오전 9시 ~ 오후 9시</strong>이며, 1회 최대 <strong>2시간</strong>까지 이용 가능합니다.
        </p>
      </div>
    </div>

    <n-spin :show="loading">
      <div class="building-grid">
        <div
          v-for="building in CAMPUS_BUILDINGS"
          :key="building.id"
          class="building-card"
          @click="goToBuilding(building.id)"
        >
          <div class="building-card__icon" :style="{ background: building.color }">
            <n-icon :component="Building2" size="32" color="#fff" />
          </div>
          <div class="building-card__body">
            <div class="building-card__header">
              <h3>{{ building.name }}</h3>
              <div class="building-card__stats">
                <n-tag type="success" size="small">
                  사용 가능 {{ availableCount(building.id) }}
                </n-tag>
                <n-tag :bordered="false" size="small">
                  전체 {{ totalCount(building.id) }}
                </n-tag>
              </div>
            </div>
            <p class="muted">{{ building.description }}</p>
            <n-divider style="margin: 12px 0" />
            <n-space :size="8">
              <n-tag
                v-if="hasType(building.id, 'MEETING_ROOM')"
                size="small"
                type="info"
                :bordered="false"
              >
                소형 회의실
              </n-tag>
              <n-tag
                v-if="hasType(building.id, 'INDIVIDUAL_SEAT')"
                size="small"
                :bordered="false"
              >
                개인 좌석
              </n-tag>
              <n-tag
                v-if="!hasType(building.id, 'MEETING_ROOM') && !hasType(building.id, 'INDIVIDUAL_SEAT')"
                size="small"
                :bordered="false"
              >
                공간 없음
              </n-tag>
            </n-space>
          </div>
          <div class="building-card__arrow">
            <n-icon :component="ChevronRight" size="20" />
          </div>
        </div>
      </div>
    </n-spin>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { Building2, ChevronRight } from '@lucide/vue'
import { spacesApi } from '@/api/spaces'
import { errorMessage } from '@/api/http'
import type { Space, SpaceType } from '@/api/types'
import { CAMPUS_BUILDINGS } from '@/config/buildings'

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const spaces = ref<Space[]>([])

function spacesForBuilding(buildingId: string) {
  return spaces.value.filter((s) => s.building === buildingId)
}

function totalCount(buildingId: string) {
  return spacesForBuilding(buildingId).length
}

function availableCount(buildingId: string) {
  return spacesForBuilding(buildingId).filter((s) => s.status === 'AVAILABLE').length
}

function hasType(buildingId: string, type: SpaceType) {
  return spacesForBuilding(buildingId).some((s) => s.spaceType === type)
}

function goToBuilding(buildingId: string) {
  router.push({ name: 'building-detail', params: { buildingId } })
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
.building-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.building-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.15s;
}

.building-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.10);
  transform: translateY(-2px);
}

.building-card__icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.building-card__body {
  flex: 1;
  min-width: 0;
}

.building-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.building-card__header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.building-card__stats {
  display: flex;
  gap: 6px;
}

.building-card__arrow {
  flex-shrink: 0;
  color: #9ca3af;
}

.muted {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}
</style>
