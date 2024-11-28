import { dialog, IpcMainInvokeEvent } from "electron";
import * as tus from "tus-js-client";
import { createReadStream, readdir, lstat, ReadStream } from "fs-extra";
import { join, extname } from 'path';
import { v4 } from 'uuid';
import crc32 from 'crc-32';

interface FileObject {
    name: string;
    path: string;
    ext: string;
    size: number;
}

export async function selectDirectory() : Promise<string> {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    return filePaths[0];
}

export async function readFiles(path: string) : Promise<FileObject[]> {
    const files = await readdir(path);
    const filteredFiles = files.filter(file => extname(file).toLowerCase() === '.tif');

    const fileObjects = await Promise.all(filteredFiles.map(async file => {
        const filePath = join(path, file);
        const stats = await lstat(filePath);
        const fileExt = extname(filePath);

        return {
            name: file,
            path: filePath,
            ext: fileExt,
            size: stats.size
        }
    }));

    return fileObjects;
}

const calculateChecksum = (stream: ReadStream): Promise<number> => {
    return new Promise((resolve, reject) => {
        let checksum = 0;

        stream.on('data', (chunk) => {
            checksum = crc32.buf(chunk as any, checksum);
        });

        stream.on('end', () => {
            checksum = (checksum >>> 0) >>> 0;
            resolve(checksum);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
};

export async function uploadFiles(event: IpcMainInvokeEvent, dirPath: string, accessToken: string, metadata: { [key: string]: string }) : Promise<void> {
    const files = await readFiles(dirPath);
    

    let totalBytesUploaded = 0;
    const totalBytesToUpload = files.reduce((acc, file) => acc + file.size, 0);

    const date = new Date();

    const folderName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${v4().split('-').slice(0, 2).join('')}`;

    async function tusUpload(file: FileObject) {
        return new Promise<void>(async (resolve, reject) => {
            const fileReadStream = createReadStream(file.path);

            const checksum : number = await calculateChecksum(fileReadStream);
            
            let previousBytesUploaded = 0;

            console.log('Uploading: ' + file.path);

            const upload = new tus.Upload(fileReadStream, {
                endpoint: import.meta.env.MAIN_VITE_TUS_ENDPOINT,
                retryDelays: [0, 3000, 5000, 10000, 20000],
                metadata: {
                    filename: file.name,
                    checksum: checksum.toString(),
                    filetype: file.ext,
                    folderName: folderName, 
                    ...metadata
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                onError: function (error: Error | tus.DetailedError) {
                    console.log(error);

                    if(error instanceof tus.DetailedError) {
                        const statusCode = error.originalResponse?.getStatus();
                        const errorMessage = error.originalResponse?.getBody();

                        // Checksum mismatch
                        if(statusCode === 460) {
                            console.warn("Checksum mismatch (460) for file:", file.name);
                            event.sender.send('upload-error', { file: file.name, message: 'Checksum mismatch' });
                            resolve(); // Resolve the promise to continue with the next file
                            return;
                        }

                        // resolve();

                    }
                    reject(error);
                },
                onProgress: function (bytesUploaded, _) {
                    const incrementalBytesUploaded = bytesUploaded - previousBytesUploaded;
                    totalBytesUploaded += incrementalBytesUploaded;
                    previousBytesUploaded = bytesUploaded;
                    
                    const percentage = ((totalBytesUploaded / totalBytesToUpload) * 100).toFixed(2);
                    event.sender.send('upload-progress', { percentage });
                },
                onSuccess: function () {
                    console.log("Uploaded!");
                    resolve();
                },
            });

            upload.findPreviousUploads().then(function (previousUploads) {
                if (previousUploads.length) {
                    upload.resumeFromPreviousUpload(previousUploads[0]);
                }
                upload.start();
            });
        });
    }

    for(const file of files) {
        await tusUpload(file);
    }

    event.sender.send('upload-completed', folderName);
}

