const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Тут всё было верно
  readDB: () => ipcRenderer.invoke('read-db'),
  
  // А тут мы добавили передачу data вторым аргументом:
  writeDB: (data) => ipcRenderer.invoke('write-db', data) 
});