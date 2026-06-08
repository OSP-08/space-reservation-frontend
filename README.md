# 공간 예약 시스템 - 프론트엔드

Vue 3, Vite, TypeScript, Naive UI 기반의 공간 예약 시스템 프론트엔드입니다. 백엔드 API는 기본적으로 `http://localhost:8080`으로 프록시됩니다.

## 로컬 개발 환경 실행

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:5173`에서 실행되며, `/api` 및 `/actuator` 경로는 백엔드로 프록시됩니다.

## Docker 배포

```bash
docker compose up -d --build
```

기본 접속 주소는 `http://localhost:3000`이며, 기본 백엔드 주소는 `http://host.docker.internal:8080`입니다.

프론트엔드와 백엔드 컨테이너가 동일한 Docker 네트워크에 있는 경우, 백엔드 서비스 이름으로 변경할 수 있습니다:

```bash
API_UPSTREAM=http://space-reservation-backend:8080 docker compose up -d --build
```

Docker Compose 플러그인 없이 Docker만 사용하는 경우:

```bash
docker build -t space-reservation-frontend:latest .
docker run -d --name space-reservation-frontend -p 3000:80 \
  -e API_UPSTREAM=http://host.docker.internal:8080 \
  space-reservation-frontend:latest
```

## 주요 기능

- 로그인, 회원가입, 로그아웃
- 공간 목록 조회, 검색, 예약, 예약 시간대 확인
- 관리자 공간 생성, 편집, 활성화 및 비활성화
- 내 예약 목록 조회 및 예약 취소
- 관리자 Google Drive 백업 관리
