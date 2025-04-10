import { BrowserWindow, ipcMain } from 'electron'
import { readFiles, selectDirectory } from '@/lib/directory'
import { uploadFile } from './lib/uploader/upload'

export const registerHandlers = (): void => {
  ipcMain.on('minimizeApp', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize()
  })

  ipcMain.on('maximizeApp', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if(win?.isMaximized()) {
      win?.unmaximize();
    } else {
      win?.maximize()
    }
  })

  ipcMain.on('closeApp', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      win.close();
    } else {
      console.log('Window already closed or destroyed.');
    }
  })

  ipcMain.handle('selectDirectory', selectDirectory)

  ipcMain.handle('readFiles', async (_, dirPath: string) => readFiles(dirPath));

  ipcMain.handle('uploadFiles', async (event, filePath, metadata, accessToken) => {
    try {
      await uploadFile(event, filePath, metadata, accessToken);
    } catch(e: any) {
      throw Error(e);
    }
  })
}
