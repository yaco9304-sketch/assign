const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// 설정 저장소
const store = new Store();

let mainWindow;

function createWindow() {
  // 메인 윈도우 생성
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false, // 준비될 때까지 숨김
  });

  // 개발 모드: Vite 개발 서버 사용
  // 프로덕션: 빌드된 파일 사용
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); // 개발자 도구 열기
  } else {
    // 프로덕션: 빌드된 React 앱 로드
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  }

  // 윈도우가 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 개발 모드가 아니면 포커스
    if (!isDev) {
      mainWindow.focus();
    }
  });

  // 윈도우가 닫힐 때
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 메뉴 설정
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: '파일',
      submenu: [
        {
          label: '새로고침',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          },
        },
        {
          label: '강제 새로고침',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reloadIgnoringCache();
            }
          },
        },
        { type: 'separator' },
        {
          label: '종료',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '편집',
      submenu: [
        { role: 'undo', label: '실행 취소' },
        { role: 'redo', label: '다시 실행' },
        { type: 'separator' },
        { role: 'cut', label: '잘라내기' },
        { role: 'copy', label: '복사' },
        { role: 'paste', label: '붙여넣기' },
      ],
    },
    {
      label: '보기',
      submenu: [
        { role: 'reload', label: '새로고침' },
        { role: 'forceReload', label: '강제 새로고침' },
        { role: 'toggleDevTools', label: '개발자 도구' },
        { type: 'separator' },
        { role: 'resetZoom', label: '확대/축소 초기화' },
        { role: 'zoomIn', label: '확대' },
        { role: 'zoomOut', label: '축소' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '전체 화면' },
      ],
    },
    {
      label: '도움말',
      submenu: [
        {
          label: '정보',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '학년 배정 시스템',
              message: '학년 배정 시스템 v1.0.0',
              detail: '교사 학년 배정 관리 프로그램',
            });
          },
        },
      ],
    },
  ];

  // macOS 메뉴 조정
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: '정보' },
        { type: 'separator' },
        { role: 'services', label: '서비스' },
        { type: 'separator' },
        { role: 'hide', label: '숨기기' },
        { role: 'hideOthers', label: '다른 항목 숨기기' },
        { role: 'unhide', label: '모두 보이기' },
        { type: 'separator' },
        { role: 'quit', label: '종료' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 앱이 준비되면
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 윈도우가 닫히면 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 설정 저장/불러오기
ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
});

