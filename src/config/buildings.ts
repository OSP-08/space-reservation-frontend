export interface Building {
  id: string
  name: string
  description: string
  color: string
}

export const CAMPUS_BUILDINGS: Building[] = [
  {
    id: 'engineering',
    name: '공학관',
    description: '컴퓨터공학과·전자공학과 강의실, 세미나실, 실습실',
    color: '#0f766e'
  },
  {
    id: 'library',
    name: '도서관',
    description: '개인 열람석, 그룹 스터디룸, 조용한 학습 공간',
    color: '#2563eb'
  },
  {
    id: 'student-union',
    name: '학생회관',
    description: '동아리 회의실, 개인 좌석, 소모임 공간',
    color: '#7c3aed'
  },
  {
    id: 'liberal-arts',
    name: '인문관',
    description: '인문·사회계열 강의실, 세미나실, 토론 공간',
    color: '#b45309'
  },
  {
    id: 'science',
    name: '자연과학관',
    description: '자연과학계열 강의실, 연구 세미나실, 실험실',
    color: '#0369a1'
  }
]

export function getBuildingById(id: string): Building | undefined {
  return CAMPUS_BUILDINGS.find((b) => b.id === id)
}
