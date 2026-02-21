import { contextBridge, IpcRendererEvent, ipcRenderer } from 'electron'
import ContextAPI from './ContextAPI';
import { BatchFile, UploadConfig } from '@shared/types';
import UploadStoreAPI from './UploadStoreAPI';

if (!process.contextIsolated) {
  throw new Error("contextIsolation must be enabled!")
}

const contextAPI: ContextAPI = {
  selectDirectory: () => ipcRenderer.invoke('selectDirectory'),
  uploadFile: (file: BatchFile, uploadConfig: UploadConfig) => ipcRenderer.invoke('uploadFiles', file, uploadConfig),
  readFiles: (dirPath: string) => ipcRenderer.invoke('readFiles', dirPath),
  onUploadProgress: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('upload-progress', callback),
  onUploadCompleted: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('upload-completed', callback),
  onUploadError: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('upload-error', callback),
  removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer),
  login: (url: string) => ipcRenderer.invoke('keycloak:login', url),
  sendMessage: (channel: string, message: string) => ipcRenderer.send(channel, [message]),
  getAppVersion: () => ipcRenderer.invoke('app:version')
}

try {
  contextBridge.exposeInMainWorld('context', contextAPI)
} catch (error) {
  console.log(error);
}

contextBridge.exposeInMainWorld("auth", {
  notifyToken: (token: string) => ipcRenderer.send("auth:update-token", token)
})

const uploadStoreAPI: UploadStoreAPI = {
  createBatch: (directoryPath: string, batchName: string, includedExtensions: string[]) =>
    ipcRenderer.invoke('upload:createBatch', directoryPath, batchName, includedExtensions),
  findActiveBatch: (directoryPath: string) => ipcRenderer.invoke('upload:findActiveBatch', directoryPath),
  markBatchCompleted: (batchId: string) => ipcRenderer.invoke('upload:markBatchCompleted', batchId),
  markFileInProgress: (fileId: string) => ipcRenderer.invoke('upload:markFileInProgress', fileId),
  markFileCompleted: (fileId: string) => ipcRenderer.invoke('upload:markFileCompleted', fileId),
  getNextFile: (batchId: string) => ipcRenderer.invoke('upload:getNextFile', batchId)
}

try {
  contextBridge.exposeInMainWorld('uploadStore', uploadStoreAPI)
} catch (error) {
  console.log(error);
}