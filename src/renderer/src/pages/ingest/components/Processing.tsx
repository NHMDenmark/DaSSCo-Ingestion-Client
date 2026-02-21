import { Button, Center, Progress, Stack, Text } from '@mantine/core'
import { useIngestionFormContext } from '../ingestion.form.context'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { IpcRendererEvent } from 'electron'
import { BatchFile, UploadConfig } from '@shared/types'
import { v4 } from 'uuid'
import { IconCheck } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { APIService } from '@renderer/services/APIService'

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
  const workflow = form.getValues().workflow
  const version = form.getValues().workflowVersion

  const { data, isPending } = useQuery({
    queryKey: ['stage:ingest'],
    queryFn: () => {
      return APIService.getWorkflowStage(workflow, version, 'ingest')
    }
  })

  const [preparing, setPreparing] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [fileProgress, setFileProgress] = useState<FileProgress>()
  const [errorMessage, setErrorMessage] = useState<string>();

  const startProcess = async () => {
    setErrorMessage(undefined);
    props.setProcessing(true)

    let batch = await window.uploadStore.findActiveBatch(form.getValues().directoryPath)

    if (!batch) {
      const date = new Date()
      const batchName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${v4().split('-').slice(0, 2).join('')}`
      batch = await window.uploadStore.createBatch(form.getValues().directoryPath, batchName, data.included_formats)
    }

    setPreparing(false);
    while (true) {
      const next = await window.uploadStore.getNextFile(batch.id);
      if (!next) break;

      setFileProgress({ index: (next.batchIndex + 1), filename: next.name, numberOfFiles: batch.fileCount })

      try {
        await window.uploadStore.markFileInProgress(next.id);
        await uploadFile(next, batch.name)
        await window.uploadStore.markFileCompleted(next.id);
      } catch (err) {
        if (err instanceof Error) {
          props.setProcessing(false);
          const idx = err.message.indexOf("Error:");
          const errorMessage = idx !== -1 ? err.message.substring(idx).trim() : err.message;
          setErrorMessage(errorMessage);
        }
        return;
      }
    }

    await window.uploadStore.markBatchCompleted(batch.id);
    props.setProcessing(false)
    props.setCompleted(true)
  }

  const uploadFile = async (file: BatchFile, batchName: string) => {
    const config: UploadConfig = {
      checksumAlgorithm: data.fixity_algorithm,
      cleanup: data.delete_after_upload,
      metadata: { ...form.getValues(), batchName: batchName }
    }
    console.log(config)
    await window.context.uploadFile(file, config)
  }

  const handleUploadProgress = (_: IpcRendererEvent, { percentage }: { percentage: string }) => {
    setUploadProgress(parseInt(percentage))
  }

  const onCompleted = () => {
    setPreparing(true);
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

          {
            preparing ? <Text ta="center" mt={5}>
              Preparing upload
            </Text> :
              <>
                <Progress value={uploadProgress} striped animated />
                <Text ta="center" mt={5}>
                  {uploadProgress + '%'}
                </Text>
              </>
          }

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
