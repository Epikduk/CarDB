const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "BroncoParts", // Здесь новое название
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // ДОБАВЬТЕ ЭТУ СТРОКУ:
    win.webContents.openDevTools(); 
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
  win.setMenu(null);
}

// ФУНКЦИЯ ОПРЕДЕЛЕНИЯ ПУТИ (Исправленная)
const getDbPath = () => {
  let dbPath;
  
  if (isDev) {
    dbPath = path.join(process.cwd(), 'car_db.json');
  } else if (process.env.PORTABLE_EXECUTABLE_DIR) {
    // Для Portable версии это папка, где лежит сам .exe
    dbPath = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'car_db.json');
  } else {
    // Для обычной установки
    dbPath = path.join(path.dirname(app.getPath('exe')), 'car_db.json');
  }
  
  return dbPath;
};

// ЧТЕНИЕ
ipcMain.handle('read-db', async () => {
  const dbPath = getDbPath();
  console.log("Попытка чтения базы по пути:", dbPath); // Это будет видно в терминале

  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } else {
    const initialData = { clients: [], cars: [] };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
});

// ЗАПИСЬ (С принудительным сбросом буфера на диск)
ipcMain.handle('write-db', async (event, data) => {
  const dbPath = getDbPath();
  
  // Проверка: если данных нет, не пытаемся записывать
  if (data === undefined) {
    console.error("Попытка записи undefined данных!");
    return false;
  }

  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(dbPath, content, 'utf-8');
    console.log("Данные успешно записаны в:", dbPath);
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