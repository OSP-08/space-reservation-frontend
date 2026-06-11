import { http, unwrap } from './http';

interface BackupResult {
  result: string;
}

export const backupApi = {
  // 백엔드는 백업 실행 엔드포인트만 제공: POST /api/admin/backup → { result }
  run() {
    return http
      .post<BackupResult>('/api/admin/backup')
      .then(unwrap<BackupResult>)
      .then((res) => res.result);
  }
};
