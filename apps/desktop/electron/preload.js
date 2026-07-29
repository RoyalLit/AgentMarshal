const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  installPersonas: (payload) => ipcRenderer.invoke('install-personas', payload),
});
