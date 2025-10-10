CREATE TABLE IF NOT EXISTS batches(
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    fileCount INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    completedAt INTEGER
);

CREATE TABLE IF NOT EXISTS batch_files(
    id TEXT PRIMARY KEY, 
    batchId TEXT NOT NULL,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    ext TEXT NOT NULL,
    batchIndex INTEGER NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY(batchId) REFERENCES batches(id)
);

CREATE INDEX IF NOT EXISTS idx_batches_path
  ON batches(path);

CREATE INDEX IF NOT EXISTS idx_batch_files_batch_status_idx
  ON batch_files(batchId, status, batchIndex);