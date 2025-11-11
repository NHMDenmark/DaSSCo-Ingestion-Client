import { Center, Select } from '@mantine/core'
import { useIngestionFormContext } from '../ingestion.form.context'

const WorkflowForm = () => {
    const form = useIngestionFormContext()
    const workflows = ['NHMD', 'AU', 'Test']

    return (
        <Center mt={50}>
            <Select
                data={workflows}
                label="Workflow"
                allowDeselect={false}
                 {...form.getInputProps('workflow')}
            >
            </Select>
        </Center>
    )
}

export default WorkflowForm
