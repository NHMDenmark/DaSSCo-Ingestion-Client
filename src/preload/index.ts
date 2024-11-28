import { contextBridge, IpcRendererEvent, ipcRenderer } from 'electron'
import ContextAPI from './ContextAPI';

if(!process.contextIsolated) {
  throw new Error("contextIsolation must be enabled!")
}

const contextAPI : ContextAPI = {
  selectDirectory: () => ipcRenderer.invoke('selectDirectory'),
  uploadFiles: (dirPath: string, accessToken: string, metadata: { [key: string]: string }) => ipcRenderer.invoke('uploadFiles', dirPath, accessToken, metadata),
  onUploadProgress: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('upload-progress', callback),
  onUploadCompleted: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('upload-completed', callback),
  onUploadError: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('upload-error', callback),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
  login: (url: string) => ipcRenderer.invoke('keycloak:login', url),
  sendMessage: (channel: string, message: string) => ipcRenderer.send(channel, [message]),
}

try {
  contextBridge.exposeInMainWorld('context', contextAPI)

} catch(error) {
  console.log(error);
}