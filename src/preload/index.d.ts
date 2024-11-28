import { ElectronAPI, IpcRenderer } from '@electron-toolkit/preload'
import ContextAPI from './ContextAPI'

declare global {
  interface Window {
    electron: ElectronAPI,
    context: ContextAPI
  }
}
