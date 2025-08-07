import { IpcMainInvokeEvent } from 'electron'
import * as tus from 'tus-js-client'
import { createReadStream, ReadStream, remove } from 'fs-extra'
import { Metadata, FileObject } from '@shared/types'
import { calculateChecksum } from '../checksum'
import FileUrlStorage from './fileUrlStorage.js'
import { dirname, join, basename, extname } from 'path'
import { RAW_FILE_EXTENSIONS } from '@shared/consts'
import log from 'electron-log/main'
import { app } from 'electron'
import path from 'path'

export async function uploadFile(
  event: IpcMainInvokeEvent,
  file: FileObject,
  metadata: Metadata,
  accessToken: string,
  cleanup: boolean
) {
  return new Promise<void>(async (resolve, reject) => {
    const checksum: number = await calculateChecksum(file.path)

    const uploadStream: ReadStream = createReadStream(file.path)

    const uploadUrlStoragePath = path.join(app.getPath('userData'), 'upload-urls.json')
    const fileUrlStorage = new FileUrlStorage(uploadUrlStoragePath)

    const upload = new tus.Upload(uploadStream, {
      endpoint: import.meta.env.MAIN_VITE_TUS_ENDPOINT,
      urlStorage: fileUrlStorage,
      removeFingerprintOnSuccess: true,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        checksum: checksum.toString(),
        filetype: file.ext,
        ...metadata
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      onError: function (error: Error | tus.DetailedError) {
        if (error instanceof tus.DetailedError) {
          const statusCode = error.originalResponse?.getStatus()
          // const errorMessage = error.originalResponse?.getBody()

          if (statusCode === 403) {
            reject(`${statusCode} Authorization Error`)
          }

          // Network or server errror
          if (error.originalRequest) {
            reject(`Network or Server Error: ${statusCode}`)
          }
        }
        log.info('Upload error:', error)
        reject(error)
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)

        if (!event.sender.isDestroyed()) {
          event.sender.send('upload-progress', { percentage })
        }
      },
      onShouldRetry(error, _retryAttempt, _options) {
        const status = error.originalResponse ? error.originalResponse.getStatus() : 0

        // Reupload if there is a checksum mismatch
        if (status === 460) {
          console.warn('Checksum mismatch (460) for file:', file.name)
          //event.sender.send('upload-error', { file: file.name, message: 'Checksum mismatch' })
          return true
        }

        if (status === 461) {
          console.warn('File size mismatch (461) for:', file.name)
          return true
        }

        return false
      },
      onSuccess: async function () {
        if (cleanup) {
          deleteFiles(file.path)
        }
        log.info(`File: ${file.path} uploaded successfully`)
        resolve()
      }
    })

    upload.findPreviousUploads().then(function (previousUploads) {
      if (previousUploads.length) {
        log.info('Previous upload found')
        upload.resumeFromPreviousUpload(previousUploads[0])
      }
      upload.start()
    })
  })
}

async function deleteFiles(filePath: string): Promise<void> {
  try {
    const dir = dirname(filePath)
    const filename = basename(filePath, extname(filePath))
    await remove(filePath)

    for (const ext of RAW_FILE_EXTENSIONS) {
      const rawFilePath = join(dir, `${filename}${ext}`)
      await remove(rawFilePath)
    }
  } catch (error) {
    log.error('Error deleting files: ' + error)
  }
}
