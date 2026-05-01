const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron');
const path = require('path');
const fs = require('fs');

// Устанавливаем ID для корректного отображения одной иконки на панели задач
app.setAppUserModelId('com.broncomparts.app');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "BroncomParts",
    icon: path.join(__dirname, '../icon.ico'),
    backgroundColor: '#0a0b0d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // ВКЛЮЧАЕМ КОПИРОВАНИЕ МЫШКОЙ
  win.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();
    if (params.editFlags.canCopy) {
      menu.append(new MenuItem({ label: 'Копировать', role: 'copy' }));
    }
    if (params.editFlags.canPaste) {
      menu.append(new MenuItem({ label: 'Вставить', role: 'paste' }));
    }
    if (params.editFlags.canSelectAll) {
      menu.append(new MenuItem({ label: 'Выделить всё', role: 'selectAll' }));
    }
    if (menu.items.length > 0) menu.popup();
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools(); 
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
  win.setMenu(null);
}

// ВОЗВРАЩАЕМ ПУТЬ К ФАЙЛУ РЯДОМ С ПРИЛОЖЕНИЕМ
const getDbPath = () => {
  let dbPath;
  
  if (isDev) {
    // В режиме разработки — корень папки проекта
    dbPath = path.join(process.cwd(), 'car_db.json');
  } else if (process.env.PORTABLE_EXECUTABLE_DIR) {
    // Для Portable версии — папка, где лежит сам .exe
    dbPath = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'car_db.json');
  } else {
    // Для обычной установки — папка с .exe
    dbPath = path.join(path.dirname(app.getPath('exe')), 'car_db.json');
  }
  
  return dbPath;
};

// ЧТЕНИЕ
ipcMain.handle('read-db', async () => {
  const dbPath = getDbPath();
  console.log("Читаю базу из:", dbPath);

  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } else {
    const initialData = { clients: [], cars: [], noteOptions: [] };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
});

// ЗАПИСЬ
ipcMain.handle('write-db', async (event, data) => {
  const dbPath = getDbPath();
  if (data === undefined) return false;

  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(dbPath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error("ОШИБКА ЗАПИСИ:", error);
    return false;
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});