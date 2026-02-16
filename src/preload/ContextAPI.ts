import { IpcRendererEvent } from "electron";
import { BatchFile, DirectorySelectionResult, FileObject, UploadConfig } from "@shared/types";

interface ContextAPI {
    selectDirectory(): Promise<DirectorySelectionResult>;
    readFiles(dirPath: string): Promise<FileObject[]>;
    uploadFile(file: BatchFile, uploadConfig: UploadConfig): Promise<void>;
    onUploadProgress(callback: (event: IpcRendererEvent, ...args: any[]) => void): void;
    onUploadCompleted(callback: (event: IpcRendererEvent, ...args: any[]) => void): void;
    onUploadError(callback: (event: IpcRendererEvent, ...args: any[]) => void): void;
    removeAllListeners(channel: string): void;
    login: (url: string) => void;
    sendMessage: (channel: string, message: string) => void;
    getAppVersion: () => Promise<string>;
}

export default ContextAPI;