import { Button, Center, Progress, Stack, Text } from '@mantine/core'
import { useIngestionFormContext } from '../ingestion.form.context'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { IpcRendererEvent } from 'electron'
import { KeycloakService } from '@renderer/services/KeycloakService'
import { APIService } from '@renderer/services/APIService'
import { FileObject } from '@shared/types'
import { v4 } from 'uuid'
import { IconCheck } from '@tabler/icons-react'

interface IProcessingProps {
  processing: boolean
  setProcessing: Dispatch<SetStateAction<boolean>>
  completed: boolean
  setCompleted: Dispatch<SetStateAction<boolean>>
  onCompletedCallback: any
}

interface FileProgress {
  index: number,
  filename: string;
  numberOfFiles: number;
}

const Processing = (props: IProcessingProps): JSX.Element => {
  const form = useIngestionFormContext()
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [fileProgress, setFileProgress] = useState<FileProgress>()
  const [errorMessage, setErrorMessage] = useState<string>();

  const startProcess = async () => {
    setErrorMessage(undefined);
    props.setProcessing(true)
    const files = await window.context.readFiles(form.getValues().directoryPath)

    const date = new Date()

    // The folder the file should be uploaded to
    const folderName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${v4().split('-').slice(0, 2).join('')}`

    try {
      for (const [index, file] of files.entries()) {
        setFileProgress({ index: (index + 1), filename: file.name, numberOfFiles: files.length })
        await KeycloakService.refreshToken();
        await uploadFile(file, folderName)
      }
      // Upload completed
      props.setProcessing(false)
      props.setCompleted(true)
      // await APIService.sendFolderName(folderName);
    } catch (err) {
      if (err instanceof Error) {
        props.setProcessing(false);
        const idx = err.message.indexOf("Error:");
        const errorMessage = idx !== -1 ? err.message.substring(idx).trim() : err.message;
        setErrorMessage(errorMessage);
      }
    }
  }

  const uploadFile = async (file: FileObject, folderName: string) => {
    await window.context.uploadFile(
      file,
      { ...form.getValues(), folderName: folderName },
      KeycloakService.getToken()
    )
  }

  const handleUploadProgress = (_: IpcRendererEvent, { percentage }: { percentage: string }) => {
    setUploadProgress(parseInt(percentage))
  }

  const onCompleted = () => {
    props.onCompletedCallback()
  }

  useEffect(() => {
    window.context.onUploadProgress(handleUploadProgress)

    return () => {
      window.context.removeAllListeners('upload-progress')
    }
  }, [])

  return (
    <div>
      {!props.processing && !props.completed && (
        <Center>
          <Button mt={40} mb={20} onClick={startProcess}>
            {errorMessage ? "Retry Upload" : "Start Upload"}
          </Button>
        </Center>
      )}

      {
        errorMessage &&
        <Text ta="center" c="red">{errorMessage}</Text>
      }


      {props.processing && (
        <Stack mt={80}>
          <Text mt={30} fw={700} ta="center">
            Uploading {fileProgress?.filename} {fileProgress?.index}/{fileProgress?.numberOfFiles}
          </Text>
          <Progress value={uploadProgress} striped animated />
          <Text ta="center" mt={5}>
            {uploadProgress + '%'}
          </Text>
        </Stack>
      )}

      {props.completed && (
        <Center mt={30}>
          <Stack>
            <Button mt={20} rightSection={<IconCheck size={20} />} onClick={onCompleted} bg={"green"}>Completed</Button>
          </Stack>
        </Center>
      )}
    </div>
  )
}

export default Processing
