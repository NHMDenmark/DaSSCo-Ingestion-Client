import { FileObject, Batch, BatchFile } from "@shared/types";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { app } from 'electron'
import path from 'path'
import { readFiles } from "./lib/directory";
import initSql from '../../resources/db/init.sql?raw';

const db = new Database(path.join(app.getPath('userData'), 'uploads.db'))
db.exec(initSql);

export const createBatch = async(
    directoryPath: string,
    batchName: string,
    includedExtensions: string[] = []
): Promise<Batch> => {
    const id = randomUUID()
    const now = Date.now()

    const insertBatch = db.prepare<Batch>(
        `INSERT INTO batches (id, path, name, fileCount, createdAt) 
     VALUES (@id, @path, @name, @fileCount, @createdAt)`
    )

    const insertFile = db.prepare<BatchFile>(
        `INSERT INTO batch_files (id, batchId, path, name, ext, batchIndex, status)
     VALUES (@id, @batchId, @path, @name, @ext, @batchIndex, 'pending')`
    )

    const files: FileObject[] = await readFiles(directoryPath, includedExtensions);

    const tx = db.transaction(() => {
        insertBatch.run({ id, path: directoryPath, name: batchName, fileCount: files.length, createdAt: now })

        files.forEach((f, i) => {
            insertFile.run({
                id: randomUUID(),
                batchId: id,
                path: f.path,
                name: f.name,
                ext: f.ext,
                batchIndex: i,
            })
        })
    })
    tx();
    return getBatch(id)!
}

export const findActiveBatchByDirectory = (directoryPath: string) => {
    const batch = db.prepare(`SELECT * FROM batches WHERE path = ?`).get(directoryPath) as Batch
    return batch || null
}

const getBatch = (id: string): Batch | null => {
    const batch = db.prepare(`SELECT * FROM batches WHERE id = ?`).get(id) as Batch
    return batch || null;
}

export const markBatchCompleted = (batchId: string) => {
    db.prepare(
        `UPDATE batches SET completedAt = ? WHERE id = ?`
    ).run(Date.now(), batchId)
}

export const markFileInProgress = (fileId: string) => {
    db.prepare(
        `UPDATE batch_files SET status = 'progress' WHERE id = ?`
    ).run(fileId)
}

export const markFileCompleted = (fileId: string) => {
    db.prepare(
        `UPDATE batch_files SET status='completed' WHERE id = ?`
    ).run(fileId)
}

export const getNextFile = (batchId: string): BatchFile => {
    const row = db.prepare(`SELECT * FROM batch_files 
     WHERE batchId = ? AND status IN ('pending','progress')
     ORDER BY batchIndex ASC LIMIT 1`
    ).get(batchId) as BatchFile
    return row || null;
}