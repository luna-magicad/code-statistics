const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openFileExplorer: (callback: (selection: string | undefined) => void) => {
    ipcRenderer.once('selectedDirectory', (event: unknown, selection: string | undefined) => {
      callback(selection);
    });
    ipcRenderer.send('openFileExplorer');
  },
})
