import { Center, Select } from '@mantine/core'
import { useIngestionFormContext } from '../ingestion.form.context'
import { useQuery } from '@tanstack/react-query'
import { APIService } from '@renderer/services/APIService'
import CenterLoader from '@renderer/components/loader/CenterLoader'

const WorkflowForm = () => {
    const form = useIngestionFormContext()
    const { data, isPending } = useQuery({
        queryKey: ["workflows"],
        queryFn: APIService.getWorkflows, // returns { name, version }[]
    });

    if (isPending) return <CenterLoader />

    const options = data.map((w) => ({ value: w.name, label: w.name }));
    
    return (
        <Center mt={50}>
            <Select
                key={form.key("workflow")}
                data={options}
                label="Workflow"
                allowDeselect={false}
                {...form.getInputProps("workflow")}
                onChange={(name) => {
                    form.getInputProps("workflow").onChange(name);

                    const selected = data.find((w) => w.name === name);
                    if (selected) {
                        form.setFieldValue("workflowVersion", selected.version);
                        form.setFieldValue('preIngestResults', []);
                    }
                }}
            />
        </Center>
    )
}

export default WorkflowForm
