import { Batch, BatchFile } from "@shared/types";

interface UploadStoreAPI {
    createBatch(directoryPath: string, batchName: string, includedExtensions: string[]): Promise<Batch>
    findActiveBatch(directoryPath: string): Promise<Batch | null>
    markBatchCompleted(batchId: string): Promise<void>
    markFileInProgress(fileId: string): Promise<void>
    markFileCompleted(fileId: string): Promise<void>
    getNextFile(batchId: string): Promise<BatchFile | null>
}

export default UploadStoreAPI;