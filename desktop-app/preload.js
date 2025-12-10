const { contextBridge, ipcRenderer } = require('electron');

// 안전하게 API 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 설정 저장/불러오기
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key),
  },
  
  // 플랫폼 정보
  platform: process.platform,
  
  // 앱 버전
  version: process.versions.electron,
});




