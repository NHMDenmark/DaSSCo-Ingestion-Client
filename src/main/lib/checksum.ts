import crc32 from 'crc-32'
import { createReadStream } from 'fs-extra'

/**
 * Calculates the CRC32 checksum of a given file.
 * @param filePath - The path of the file.
 * @returns {Promise<number>} The calculated CRC32 checksum.
 */
export const calculateChecksum = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    let checksum = 0
    const stream = createReadStream(filePath)
    
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
