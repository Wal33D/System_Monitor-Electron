const { app, Menu, ipcMain } = require("electron");

const path = require("path");
const Store = require("./Store");
const MainWindow = require("./MainWindow");
const AppTray = require("./AppTray");

// Set env
process.env.NODE_ENV = "dev";

const isDev = process.platform === "dev" ? true : false;
const isMac = process.platform === "darwin" ? true : false;
const isLinux = process.platform === "linux" ? true : false;

let mainWindow;
let tray;

// Init store
const store = new Store({
  configName: "user-settings",
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5,
    },
  },
});

function createMainWindow() {
  mainWindow = new MainWindow("./app/index.html", isDev, isMac);
}

app.on("ready", () => {
  createMainWindow();
  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("settings:get", store.get("settings"));
  });

  // actions on the mainWindow
  mainWindow.on("close", (e) => {
    if (!app.isQuitting === true) {
      e.preventDefault();
      mainWindow.hide();
    }
    return true;
  });

  // create tray
  const icon = path.join(__dirname, "assets", "icons", "tray_icon.png");
  tray = new AppTray(icon, mainWindow);

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
mainWindow.setMenuBarVisibility(false)

});

const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    role: "fileMenu",
  },
  {
    label: "View",
    submenu: [
      {
        label: "Toggle Navigation",
        click: () => mainWindow.send("nav:toggle"),
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

// set settings
ipcMain.on("settings:set", (e, value) => {
  store.set("settings", value);
  // get current value and set it
  mainWindow.webContents.send("settings:get", store.get("settings"));
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
