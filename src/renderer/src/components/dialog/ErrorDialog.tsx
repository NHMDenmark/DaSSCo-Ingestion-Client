import { Modal, Text } from '@mantine/core'

interface IErrorDialogProps {
  opened: boolean
  setOpened: React.Dispatch<React.SetStateAction<boolean>>
  errorMessage?: string
}

const ErrorDialog = ({ opened, setOpened, errorMessage }: IErrorDialogProps) => {
  const onClose = () => {
    setOpened(false)
  }

  return (
    <Modal opened={opened} onClose={onClose} title={<Text size="lg">Error</Text>} centered>
      <div
        style={{
          borderLeft: '4px solid red',
          padding: '16px',
          backgroundColor: '#fff'
        }}
      >
        {errorMessage}
      </div>
    </Modal>
  )
}

export default ErrorDialog
