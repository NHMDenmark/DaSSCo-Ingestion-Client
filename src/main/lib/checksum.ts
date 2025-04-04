import crc32 from 'crc-32'
import { ReadStream } from 'fs-extra'

/**
 * Calculates the CRC32 checksum of a given readable stream.
 * @param stream - A readable stream of the file.
 * @returns {Promise<number>} The calculated CRC32 checksum.
 */
export const calculateChecksum = (stream: ReadStream): Promise<number> => {
  return new Promise((resolve, reject) => {
    let checksum = 0

    stream.on('data', (chunk) => {
      checksum = crc32.buf(chunk as any, checksum)
    })

    stream.on('end', () => {
      checksum = checksum >>> 0
      resolve(checksum)
    })

    stream.on('error', (err) => {
      reject(err)
    })
  })
}
