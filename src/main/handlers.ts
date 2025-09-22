import { BrowserWindow, ipcMain } from 'electron'
import { readFiles, selectDirectory } from '@/lib/directory'
import { uploadFile } from './lib/uploader/upload'
import log from 'electron-log/main'
import { TokenManager } from './lib/token.manager'

export const registerHandlers = (): void => {

  ipcMain.on('auth:update-token', (_event, token: string) => {
      log.info('Token refreshed')
      TokenManager.set(token);
  })

  ipcMain.on('minimizeApp', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
  })

  ipcMain.on('maximizeApp', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win?.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.on('closeApp', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
  })

  ipcMain.handle('selectDirectory', selectDirectory)

  ipcMain.handle('readFiles', async (_, dirPath: string) => readFiles(dirPath))

  ipcMain.handle('uploadFiles', async (event, file, metadata, cleanup) => {
    try {
      await uploadFile(event, file, metadata, cleanup)
    } catch (e: any) {
      log.info('Error during file upload:', e)
      throw Error(e)
    }
  })
}
