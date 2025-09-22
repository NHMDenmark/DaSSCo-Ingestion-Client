import { IpcRendererEvent } from "electron";
import { DirectorySelectionResult, FileObject, Metadata } from "@shared/types";

interface ContextAPI {
    selectDirectory(): Promise<DirectorySelectionResult>;
    readFiles(dirPath: string): Promise<FileObject[]>;
    uploadFile(file: FileObject, metadata: Metadata, cleanup: boolean): Promise<void>;
    onUploadProgress(callback: (event: IpcRendererEvent, ...args: any[]) => void): void;
    onUploadCompleted(callback: (event: IpcRendererEvent, ...args: any[]) => void): void;
    onUploadError(callback: (event: IpcRendererEvent, ...args: any[]) => void): void;
    removeAllListeners(channel: string): void;
    login: (url: string) => void;
    sendMessage: (channel: string, message: string) => void;
    getAppVersion: () => Promise<string>;
}

export default ContextAPI;