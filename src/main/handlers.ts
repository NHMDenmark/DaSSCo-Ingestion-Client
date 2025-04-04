import { BrowserWindow, ipcMain } from 'electron'
import { readFiles, selectDirectory } from '@/lib/directory'
import { uploadFile } from './lib/uploader/upload'

export const registerHandlers = (window: BrowserWindow | null): void => {
  ipcMain.on('minimizeApp', () => {
    window!.minimize()
  })

  ipcMain.on('maximizeApp', () => {
    window!.maximize()
  })

  ipcMain.on('closeApp', () => {
    if (window && !window.isDestroyed()) {
      window.close()
    }
  })

  ipcMain.handle('selectDirectory', selectDirectory)

  ipcMain.handle('readFiles', async (_, dirPath: string) => readFiles(dirPath));

  ipcMain.handle('uploadFiles', async (event, filePath, metadata, accessToken) => {
    try {
      await uploadFile(event, filePath, metadata, accessToken, window!);
    } catch(e: any) {
      throw Error(e);
    }
  })
}
