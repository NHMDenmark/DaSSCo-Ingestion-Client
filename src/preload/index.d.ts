import { ElectronAPI, IpcRenderer } from '@electron-toolkit/preload'
import ContextAPI from './ContextAPI'
import UploadStoreAPI from './UploadStoreAPI'

declare global {
  interface Window {
    electron: ElectronAPI,
    context: ContextAPI,
    uploadStore: UploadStoreAPI
    auth: any
  }
}
