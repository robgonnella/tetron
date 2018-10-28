import {app, BrowserWindow, screen} from 'electron';
import * as path from 'path';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | undefined;

const mainView = path.join(__dirname, 'index.html');

function createWindow (): void {
  const workarea: Electron.Rectangle = screen.getPrimaryDisplay().workArea;
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    useContentSize: true,
    resizable: false
  });

  // and load the index.html of the app.
  mainWindow.loadFile(mainView);

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({mode: 'detach'});
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    if (mainWindow) {
      mainWindow.close();
    }
    mainWindow = undefined;
  })
}

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === undefined) {
    createWindow()
  }
})
