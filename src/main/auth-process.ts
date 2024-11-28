import { BrowserWindow } from "electron";

let authWindow: BrowserWindow | null = null;

export function createAuthWindow(authUrl: string, callback: () => void): void {
  destroyAuthWindow();

  authWindow = new BrowserWindow({
    x: 60,
    y: 60,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false
    }
  });

  authWindow.loadURL(authUrl);
  authWindow.show();

  const {
    session: { webRequest }
  } = authWindow.webContents

  const filter = {
    urls: [
      'http://localhost/keycloak-redirect*',
    ]
  }

  webRequest.onBeforeRequest(filter, async ({}) => {
    callback();
    return destroyAuthWindow();
  });

  authWindow.on('closed', () => authWindow = null);
}

function destroyAuthWindow() {
  if (!authWindow) return;
  authWindow.close();
  authWindow = null;
}