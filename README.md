# 空间预约前端

基于 Vue 3、Vite、TypeScript 和 Naive UI 的空间预约系统前端。后端接口默认转发到 `http://localhost:8080`。

## 本地开发

```bash
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`，`/api` 和 `/actuator` 会代理到后端。

## Docker 部署

```bash
docker compose up -d --build
```

默认访问地址是 `http://localhost:3000`，默认后端地址是 `http://host.docker.internal:8080`。

如果前后端容器在同一个 Docker 网络里，可以改成后端服务名：

```bash
API_UPSTREAM=http://space-reservation-backend:8080 docker compose up -d --build
```

没有 Docker Compose 插件时，也可以直接使用 Docker：

```bash
docker build -t space-reservation-frontend:latest .
docker run -d --name space-reservation-frontend -p 3000:80 \
  -e API_UPSTREAM=http://host.docker.internal:8080 \
  space-reservation-frontend:latest
```

## 功能

- 登录、注册、退出登录
- 空间列表、搜索、预约、预约时段查看
- 管理员空间创建、编辑、启用和停用
- 我的预约列表和取消预约
- 管理员 Google Drive 备份管理
