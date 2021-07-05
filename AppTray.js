const { app, Menu, Tray } = require("electron");

class AppTray extends Tray {
  constructor(icon, mainWindow) {
    super(icon);
    this.setToolTip("SysTop");
    this.mainWindow = mainWindow;
    //actions

  }
  onClick() {
    if (this.mainWindow.isVisible() === true) {
      this.mainWindow.hide();
    } else {
      this.mainWindow.show();
    }
  }

  // left-click:
  // Important: it is only the click on the tray (not on the close button)
  onRightClick() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Quit",
        click: () => {
          (app.isQuitting = true), app.quit();
        },
      },
    ]);
    this.setContextMenu(contextMenu);
  }
}

module.exports = AppTray;
