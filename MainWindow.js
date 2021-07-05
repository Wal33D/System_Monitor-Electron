const { BrowserWindow } = require('electron')

class mainWindow extends BrowserWindow {
  constructor(file, isDev, isMac) {
    super({
      title: 'SysTop',
      width: isDev ? 400 : 400,
      height: 600,
      icon: './assets/icons/icon.png',
      resizable: false,
      show: isMac ? false : true,
      frame:false,
      opacity: 0.9,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
    })
    this.loadFile(file)
      this.webContents.openDevTools();
  }
}

module.exports = mainWindow