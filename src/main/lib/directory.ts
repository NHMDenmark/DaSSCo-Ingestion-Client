import { readdir } from 'fs-extra'
import { join, extname, parse } from 'path'
import { dialog } from 'electron'
import { FileObject, DirectorySelectionResult, ValidationResult } from '@shared/types'
import { RAW_FILE_EXTENSIONS, ALLOWED_FILE_EXTENSIONS } from '@shared/consts'

/**
 * Opens a dialog for the user to select a directory and validates its content.
 * @returns {Promise<DirectorySelectionResult>} An object containing:
 * - `dirPath`: The selected directory path.
 * - `errorMessage`: An optional error message if validation fails.
 */
export async function selectDirectory(): Promise<DirectorySelectionResult> {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  const dirPath: string = filePaths[0]

  if (dirPath) {
    const validation = await validateDirectory(dirPath)

    if (!validation.isValid) {
      return { dirPath: null, errorMessage: validation.errorMessage }
    }
  }

  return { dirPath: dirPath }
}

/**
 * Validates the content of a directory.
 * Requirements:
 * 1. The directory must have at least one TIFF file.
 * 2. The directory must not contain multiple raw formats.
 * 3. Each TIFF file must have a corresponding raw file (.raf or .crc3).
 * @param {String} dirPath - The selected directory path.
 * @returns {Promise<ValidationResult>} containing:
 * - `isValid`: true if the directory fulfills all requirements.
 * - `errorMessage`: An optional error message if validation fails.
 */
async function validateDirectory(dirPath: string): Promise<ValidationResult> {
  const files = await readdir(dirPath)

  const tiffFiles = files.filter((file) => ALLOWED_FILE_EXTENSIONS.includes(extname(file).toLowerCase()))

  if (tiffFiles.length === 0) {
    return { isValid: false, errorMessage: 'No TIFF files found in the folder' }
  }

  const rawFiles = files.filter((file) => RAW_FILE_EXTENSIONS.includes(extname(file).toLowerCase()))

  const usedRawExts = new Set(rawFiles.map((file) => extname(file).toLowerCase()))

  if (usedRawExts.size > 1) {
    return { isValid: false, errorMessage: 'Multiple raw file formats detected in folder' }
  }

  for (const tiffFile of tiffFiles) {
    const basename = parse(tiffFile).name

    const hasRawFile = RAW_FILE_EXTENSIONS.some((ext) => rawFiles.includes(basename + ext))

    if (!hasRawFile) {
      return { isValid: false, errorMessage: `File ${tiffFile} has no corresponding raw file` }
    }
  }

  return { isValid: true }
}

/**
 * Reads and filters files from a specified directory based on allowed extensions.
 * @param dirPath
 * @returns {Promise<FileObject[]>} An array where each element contains:
 * - `name`: The filename.
 * - `path`: The absolute file path.
 * - `ext`: The file extension.
 */
export async function readFiles(dirPath: string): Promise<FileObject[]> {
  const files = await readdir(dirPath)

  const filteredFiles = files.filter((file) =>
    ALLOWED_FILE_EXTENSIONS.includes(extname(file).toLowerCase())
  )

  const fileObjects: FileObject[] = filteredFiles.map((file) => {
    const filePath = join(dirPath, file)
    const fileExt = extname(filePath)

    return {
      name: file,
      path: filePath,
      ext: fileExt
    }
  })

  return fileObjects
}
