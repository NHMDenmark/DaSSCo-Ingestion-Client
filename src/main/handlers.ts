import { BrowserWindow, ipcMain } from 'electron'
import { readFiles, selectDirectory } from '@/lib/directory'
import { uploadFile } from './lib/uploader/upload'

export const registerHandlers = (): void => {
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

  ipcMain.handle('uploadFiles', async (event, file, metadata, accessToken, cleanup) => {
    try {
      await uploadFile(event, file, metadata, accessToken, cleanup)
    } catch (e: any) {
      throw Error(e)
    }
  })
}
