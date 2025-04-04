import { BrowserWindowConstructorOptions } from 'electron'
import icon from '../../resources/icon.ico?asset'
import { join } from 'path'

const HEIGHT = 680
const WIDTH = 800

const options: BrowserWindowConstructorOptions = {
  height: HEIGHT,
  width: WIDTH,
  minHeight: HEIGHT,
  minWidth: WIDTH,
  show: false,
  frame: false,
  autoHideMenuBar: true,
  center: true,
  title: 'DaSSCo Ingestion Client',
  ...(process.platform === 'darwin' ? { icon } : { icon }),
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: true,
    nodeIntegration: false,
    contextIsolation: true,
    webSecurity: true
  }
}

export default options
