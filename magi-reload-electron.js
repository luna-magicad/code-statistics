const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Modified source from electron-reload to not use 8 sub dependencies.
// https://github.com/yan-foto/electron-reload/blob/master/main.js
module.exports = (src) => {
  /**
   * @type {BrowserWindow[]}
   */
  const browserWindows = [];
  const watchPath = path.join(__dirname, src);

  const softResetWindows = () => {
    for (const browserWindow of browserWindows) {
      browserWindow.webContents.reloadIgnoringCache();
    }
  }

  app.on('browser-window-created', (error, browserWindow) => {
    browserWindows.push(browserWindow);

    browserWindow.on('closed', () => {
      const index = browserWindows.indexOf(browserWindow);
      browserWindows.splice(index, 1);
    });
  });

  fs.watch(watchPath, {
    recursive: true,
  }, (eventType, filename) => {
    if (!filename.endsWith('.js') && !filename.endsWith('.html')) {
      return;
    }
    softResetWindows();
  });
};
