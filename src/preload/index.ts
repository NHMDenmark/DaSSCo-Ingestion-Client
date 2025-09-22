import { contextBridge, IpcRendererEvent, ipcRenderer } from 'electron'
import ContextAPI from './ContextAPI';
import { FileObject, Metadata } from '@shared/types';

if(!process.contextIsolated) {
  throw new Error("contextIsolation must be enabled!")
}

const contextAPI : ContextAPI = {
  selectDirectory: () => ipcRenderer.invoke('selectDirectory'),
  uploadFile: (file: FileObject, metadata: Metadata, cleanup: boolean) => ipcRenderer.invoke('uploadFiles', file, metadata, cleanup),
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
} catch(error) {
  console.log(error);
}

contextBridge.exposeInMainWorld("auth", {
    notifyToken: (token: string) => ipcRenderer.send("auth:update-token", token)
})