const { ipcMain, dialog } = require('electron');

exports.setupOpenFileExplorer = function(): void {
  ipcMain.on('openFileExplorer', (event: any) => {
    let selection: string | undefined;
    try {
      selection = dialog.showOpenDialogSync({
        properties: ['openDirectory'],
      });
    } finally {
      event.reply('selectedDirectory', selection);
    }
  });
}
