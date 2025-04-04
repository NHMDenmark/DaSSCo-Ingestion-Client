import { Box, Button, Center, Stack, Text, Blockquote, List } from '@mantine/core'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useIngestionFormContext } from '../ingestion.form.context'
import ErrorDialog from '@renderer/components/dialog/ErrorDialog'
import { IconInfoCircle } from '@tabler/icons-react'

interface IDirectorySelectorProps {
  disabled: boolean
  setDisabled: Dispatch<SetStateAction<boolean>>
}

const DirectorySelector = (props: IDirectorySelectorProps) => {
  const form = useIngestionFormContext()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [opened, setOpened] = useState<boolean>(false)


  const selectDirectory = async () => {
    const { dirPath, errorMessage } = await window.context.selectDirectory()

    if (dirPath) {
      form.setFieldValue('directoryPath', dirPath)
    }

    if (errorMessage) {
      setErrorMessage(errorMessage)
      setOpened(true)
    }
  }

  useEffect(() => {
    props.setDisabled(!form.getValues().directoryPath);
  }, [form.getValues().directoryPath])

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30
      }}
    >
      <Stack>
        <Text ta="center" c="gray">
          Select a folder  to upload/ingest
        </Text>
        <Center>
          <Button mt={10} w={150} h={50} onClick={selectDirectory}>
            Select Folder
          </Button>
        </Center>
        {form.getValues().directoryPath && (
          <Text ta="center">
            <b>Selected folder:</b> {form.getValues().directoryPath}
          </Text>
        )}

        <Blockquote mt={30} color="yellow" icon={<IconInfoCircle />}>
          <Text fw={700}>Resuming an Upload After a Crash or Failure</Text>
        


           <Text>If your upload failed or was interrupted, you can resume it by following these steps:</Text>
           <Text>The ingestion client tracks whether a folder was fully uploaded.</Text>
           <Text>If you started the upload and it got interrupted, restart the ingestion client.</Text>
           <Text>After restarting the client, log in and choose the same folder, and then choose the same metadata options to resume from where it left off.</Text>
           <Text>The client resumes the interrupted file from its last position and continues with the remaining files.</Text>

           <Text>If you did not start the failed/interrupted upload:</Text>

          <List>
            <List.Item>Make sure you are the person that is logged in to the ingestion client.</List.Item>
            <List.Item>Choose the folder that failed.</List.Item>
            <List.Item>Choose metadata options that resembles the previous upload as closely as possible (to the best of your knowledge).</List.Item>
            <List.Item>The client resumes the interrupted file from its last position (it will use the previous metadata for the last file that was in the queue, including the previous user as "ingester") and continues with the remaining files with the new metadata options.</List.Item>
          </List>

        </Blockquote>
      </Stack>

      <ErrorDialog opened={opened} setOpened={setOpened} errorMessage={errorMessage} />
    </Box>
  )
}

export default DirectorySelector
