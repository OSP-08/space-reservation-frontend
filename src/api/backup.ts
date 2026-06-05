import { http, unwrap } from './http';
import type { BackupFile } from './types';

export const backupApi = {
  run() {
    return http.post('/api/admin/backup/run').then(unwrap<string>);
  },
  files() {
    return http.get('/api/admin/backup/files').then(unwrap<BackupFile[]>);
  },
  cleanup() {
    return http.delete('/api/admin/backup/cleanup').then(unwrap<void>);
  },
  deleteFile(fileId: string) {
    return http.delete(`/api/admin/backup/files/${fileId}`).then(unwrap<void>);
  }
};
