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
