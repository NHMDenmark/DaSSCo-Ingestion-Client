import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createAuthWindow } from './auth-process'
import options from './options'
import { registerHandlers } from './handlers'
// import { autoUpdater, UpdateInfo } from 'electron-updater';

let mainWindow: BrowserWindow | null = null

const handleCheckSSO = () => {
  const {
    session: { webRequest }
  } = mainWindow!.webContents

  const filter = {
    urls: ['http://localhost/keycloak-redirect*']
  }

  webRequest.onBeforeRequest(filter, async ({ url }) => {
    const params = url.slice(url.indexOf('?'))

    // Handles log out request
    if (!params.includes('state')) {
      return mainWindow!.reload()
    }

    const baseUrl =
      is.dev && process.env['ELECTRON_RENDERER_URL']
        ? process.env['ELECTRON_RENDERER_URL']
        : `file://${join(__dirname, '../renderer/index.html')}`

    mainWindow!.loadURL(`${baseUrl}${params}`)
  })
}

// Creates main browser window
function createWindow(): void {
  mainWindow = new BrowserWindow(options)

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': [process.env['ELECTRON_RENDERER_URL'] as string],
        'Access-Control-Allow-Credentials': ['true'],
        ...details.responseHeaders
      }
    })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // autoUpdater.autoDownload = false;
  // autoUpdater.autoInstallOnAppQuit = true;

  app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // ipcMain.handle('selectDirectory', selectDirectory)

    // ipcMain.handle('uploadFiles', async (event, dirPath, accessToken, metadata) => {
    //   try {
    //     await uploadFiles(event, dirPath, accessToken, metadata, mainWindow!)
    //   } catch (error) {
    //     console.error('Error during file upload:', error)
    //   }
    // })

    ipcMain.handle('keycloak:login', (_, url: string) => {
      createAuthWindow(url, () => {
        handleCheckSSO()
        mainWindow!.reload()
      })
    })

    ipcMain.handle('app:version', () => {
      return app.getVersion();
    })

    createWindow()

    handleCheckSSO()

    registerHandlers(mainWindow);

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // autoUpdater.checkForUpdates();
  })

  // autoUpdater.on('update-available', (info: UpdateInfo) => {
  //   mainWindow.webContents.send('update_available', info);
  // });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}