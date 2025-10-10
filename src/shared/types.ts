export type FileObject = {
    name: string;
    path: string;
    ext: string;
}

export type Metadata = {
    [key: string]: string | string[];
}

export type ValidationResult = {
    isValid: boolean
    errorMessage?: string
}
  
export type DirectorySelectionResult = {
    dirPath: string | null
    errorMessage?: string
}

export type Batch = {
    id: string;
    name: string;
    path: string;
    fileCount: number;
    createdAt: number,
    completedAt?: Date
}

export type BatchFile = {
    id: string;
    batchId: string;
    path: string;
    name: string;
    ext: string;
    batchIndex: number;
    status?: 'pending' | 'progress' | 'completed';
}