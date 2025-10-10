import { IpcMainInvokeEvent } from 'electron'
import * as tus from 'tus-js-client'
import { createReadStream, ReadStream, remove } from 'fs-extra'
import { Metadata, BatchFile } from '@shared/types'
import { calculateChecksum } from '../checksum'
import FileUrlStorage from './fileUrlStorage.js'
import { dirname, join, basename, extname } from 'path'
import { RAW_FILE_EXTENSIONS } from '@shared/consts'
import log from 'electron-log/main'
import { app } from 'electron'
import path from 'path'
import { TokenManager } from '../token.manager'

export async function uploadFile(
  event: IpcMainInvokeEvent,
  file: BatchFile,
  metadata: Metadata,
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
      onError: function (error: Error | tus.DetailedError) {
        if (error instanceof tus.DetailedError) {
          const statusCode = error.originalResponse?.getStatus()

          if (statusCode === 460) {
            reject(`Checksum mismatch (460) for: ${file.name}`)
          }

          if (statusCode === 461) {
            reject(`File size mismatch (461) for: ${file.name}`)
          }

          if (statusCode === 403) {
            reject('Authorizarion Error (403)')
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
          log.warn('Checksum mismatch (460) for file:', file.name)
          return true
        }

        if (status === 461) {
          log.warn('File size mismatch (461) for:', file.name)
          return true
        }

        if (status === 403) {
          log.warn('Authorizarion Error (403) for: ', file.name)
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
      },
      onBeforeRequest(req) {
        req.setHeader('Authorization', `Bearer ${TokenManager.get()}`)
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
