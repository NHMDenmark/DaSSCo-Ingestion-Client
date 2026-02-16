import { BrowserWindow, ipcMain } from 'electron'
import { readFiles, selectDirectory } from '@/lib/directory'
import { uploadFile } from './lib/uploader/upload'
import log from 'electron-log/main'
import { TokenManager } from './lib/token.manager'
import { createBatch, findActiveBatchByDirectory, getNextFile, markBatchCompleted, markFileCompleted, markFileInProgress } from './db'

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

  ipcMain.handle('uploadFiles', async (event, file, uploadConfig) => {
    try {
      await uploadFile(event, file, uploadConfig)
    } catch (e: any) {
      log.info('Error during file upload:', e)
      throw Error(e)
    }
  })

  // Upload store handlers
  ipcMain.handle('upload:createBatch', async(_, path, name) => createBatch(path, name))
  ipcMain.handle('upload:findActiveBatch', async(_, path) => findActiveBatchByDirectory(path))
  ipcMain.handle('upload:markBatchCompleted', async(_, id) => markBatchCompleted(id))
  ipcMain.handle('upload:markFileCompleted', async(_, id) => markFileCompleted(id))
  ipcMain.handle('upload:markFileInProgress', async(_, id) => markFileInProgress(id))
  ipcMain.handle('upload:getNextFile', async(_, id) => getNextFile(id))
}
