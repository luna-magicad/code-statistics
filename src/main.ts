const { app, BrowserWindow } = require('electron');
const path = require('path');

// Custom "preprocessor" to remove code with node.
// #if debug
const watchCopyHtml = require('../watch-copy-html');
const magiReloadElectron = require('../magi-reload-electron');
// These paths is from root of the app.
watchCopyHtml('src', 'build');
magiReloadElectron('build');
// #endif debug

const rootNodePath = __dirname;

// Most of this code comes from the introduction tutorial at https://www.electronjs.org/docs/tutorial/quick-start.
function createWindow(): void {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(rootNodePath, 'preload.js'),
      nodeIntegration: true,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Exclude MacOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
