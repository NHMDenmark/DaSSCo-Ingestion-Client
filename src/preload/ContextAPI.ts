import { IpcRendererEvent } from "electron";

interface ContextAPI {
    selectDirectory(): Promise<string>;
    uploadFiles(dirPath: string, accessToken: string, metadata: { [key: string]: string }): Promise<void>;
    onUploadProgress(callback: (event: IpcRendererEvent, ...args: any[]) => void): void
    onUploadCompleted(callback: (event: IpcRendererEvent, ...args: any[]) => void): void
    onUploadError(callback: (event: IpcRendererEvent, ...args: any[]) => void): void
    removeAllListeners(channel: string): void;
    login: (url: string) => void;
    sendMessage: (channel: string, message: string) => void;
}

export default ContextAPI;