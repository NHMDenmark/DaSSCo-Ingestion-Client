import { KeycloakService } from '@renderer/services/KeycloakService'
import { IngestionFormProvider, useIngestionForm } from './ingestion.form.context'
import { Button, Group, Stack, Stepper } from '@mantine/core'
import useSteps from '@renderer/hooks/useSteps'
import DirectorySelector from './components/DirectorySelector'
import { useState } from 'react'
import MetadataForm from './components/MetadataForm'
import Processing from './components/Processing'
import { IconFileCode, IconFolderOpen, IconSettingsAutomation, IconUsers } from '@tabler/icons-react'
import { isNotEmpty } from '@mantine/form'
import DigitiserForm from './components/DigitiserForm'
import WorkflowForm from './components/WorkflowForm'

const Ingestion = (): JSX.Element => {
  const { active, prevStep, nextStep, setStep } = useSteps({
    initialStep: 0
  })

  const [disabled, setDisabled] = useState<boolean>(false)
  const [processing, setProcessing] = useState<boolean>(false)
  const [completed, setCompleted] = useState<boolean>(false)

  const form = useIngestionForm({
    mode: 'uncontrolled',
    initialValues: {
      workflow: '',
      workflowVersion: 0,
      directoryPath: '',
      workstation: '',
      institution: '',
      collection: '',
      pipeline: '',
      fileFormat: '',
      workstationNickname: '',
      funding: ['DaSSCo Tranche 1'],
      prepType: '',
      payloadType: '',
      imager: '',
      ingestor: KeycloakService.getName(),
      otherDigitisers: []
    },
    validate: {
      directoryPath: isNotEmpty('Select a folder'),
      workstationNickname: isNotEmpty(''),
      workflow: isNotEmpty('Select a workflow'),
      imager: isNotEmpty('')
    }
  })

  const onCompletedCallback = () => {
    form.reset()
    setCompleted(false)
    setStep(0)
  }

  const handleNextStep = () => {
    let isError: boolean = false

    if (active === 0) isError = form.validateField('workflow').hasError
    if (active === 1) isError = form.validateField('directoryPath').hasError
    if (active === 2) isError = form.validateField('workstationNickname').hasError
    if (active === 3) isError = form.validateField('imager').hasError

    if (!isError) nextStep()
  }

  return (
    <IngestionFormProvider form={form}>
      <Stack align="center" mt={50}>
        <Stepper w={750} active={active} allowNextStepsSelect={false} iconSize={36} size='sm'>
          <Stepper.Step icon={<IconFolderOpen />} label="Step 1" description="Select workflow">
            <WorkflowForm/>
          </Stepper.Step>
          <Stepper.Step icon={<IconFolderOpen />} label="Step 2" description="Select folder">
            <DirectorySelector/>
          </Stepper.Step>
          <Stepper.Step icon={<IconFileCode />} label="Step 3" description="Metadata">
            <MetadataForm setDisabled={setDisabled} />
          </Stepper.Step>
          <Stepper.Step icon={<IconUsers />} label="Step 4" description="Digitisers">
            <DigitiserForm setDisabled={setDisabled} />
          </Stepper.Step>
          <Stepper.Step
            loading={processing}
            icon={<IconSettingsAutomation />}
            label="Step 5"
            description="Processing"
          >
            <Processing
              processing={processing}
              setProcessing={setProcessing}
              completed={completed}
              setCompleted={setCompleted}
              onCompletedCallback={onCompletedCallback}
            />
          </Stepper.Step>
        </Stepper>

        <Group justify="center" mt={45} p={10}>
          {active !== 0 && !processing && !completed && (
            <Button variant="default" onClick={prevStep} hidden>
              Back
            </Button>
          )}
          {active !== 4 && (
            <Button onClick={handleNextStep} disabled={disabled}>
              Next
            </Button>
          )}
        </Group>

        {/* 
        <Group justify="center" mt={480} pos="absolute" left={0} right={0}>
                    {active !== 0 && (!processing && !completed) && <Button variant="default" onClick={prevStep} hidden>Back</Button>}
                    {active !== 2 && <Button onClick={handleNextStep} disabled={disabled}>Next</Button>}
                </Group> */}
      </Stack>
    </IngestionFormProvider>
  )
}

export default Ingestion
