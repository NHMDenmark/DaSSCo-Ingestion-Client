import { KeycloakService } from "@renderer/services/KeycloakService";
import { IngestionFormProvider, useIngestionForm } from "./ingestion.form.context";
import { Button, Flex, Group, Stack, Stepper } from "@mantine/core";
import useSteps from "@renderer/hooks/useSteps";
import DirectorySelector from "./components/DirectorySelector";
import { useState } from "react";
import MetadataForm from "./components/MetadataForm";
import Processing from "./components/Processing";
import { IconFileCode, IconFolderOpen, IconSettingsAutomation } from "@tabler/icons-react";
import { isNotEmpty } from "@mantine/form";


const Ingestion = () : JSX.Element => {
    
    const { active, prevStep, nextStep, setStep } = useSteps({
        initialStep: 0
    });

    const [disabled, setDisabled] = useState<boolean>(true);
    const [processing, setProcessing] = useState<boolean>(false);
    const [completed, setCompleted] = useState<boolean>(false);

    const form = useIngestionForm({
        mode: 'uncontrolled',
        initialValues: {
            directoryPath: '',
            workstation: 'WORKHERB0001',
            institution: 'NHMD',
            collection: '',
            pipeline: 'PIPEHERB0001',
            fileFormat: 'tif',
            funding: 'DaSSCo',
            prepType: 'sheet',
            payloadType: 'image',
            digitiser: KeycloakService.getName()
        },
        validate: {
            workstation: isNotEmpty('Field is required'),
            institution: isNotEmpty('Field is required'),
            pipeline: isNotEmpty('Field is required'),
            prepType: isNotEmpty('Field is required'),
            payloadType: isNotEmpty('Field is required')
        }
    });

    const onCompletedCallback = () => {
        form.reset();
        setDisabled(true);
        setCompleted(false);
        setStep(0);
    }

    const handleNextStep = () => {
        let isError : boolean = false;

        if(active == 1) isError = form.validate().hasErrors;

        if(!isError) nextStep();
    }

    return(
        <IngestionFormProvider form={form}>
            <Flex justify="center" mt={50}>
                <Stack>
                <Stepper w={600} active={active} allowNextStepsSelect={false} iconSize={46}>
                    <Stepper.Step icon={<IconFolderOpen/>} label="Step 1" description="Select folder">
                        <DirectorySelector disabled={disabled} setDisabled={setDisabled}/>
                    </Stepper.Step>
                    <Stepper.Step icon={<IconFileCode/>} label="Step 2" description="Metadata">
                        <MetadataForm setDisabled={setDisabled}/>
                    </Stepper.Step>
                    <Stepper.Step loading={processing} icon={<IconSettingsAutomation/>} label="Step 3" description="Processing">
                        <Processing 
                            processing={processing} 
                            setProcessing={setProcessing}
                            completed={completed} 
                            setCompleted={setCompleted}
                            onCompletedCallback={onCompletedCallback}
                        />
                    </Stepper.Step>
                </Stepper>

                <Group justify="center" mt={480} pos="absolute" left={0} right={0}>
                    {active !== 0 && (!processing && !completed) && <Button variant="default" onClick={prevStep} hidden>Back</Button>}
                    {active !== 2 && <Button onClick={handleNextStep} disabled={disabled}>Next</Button>}
                </Group>
                </Stack>
            </Flex>
        </IngestionFormProvider>
    )

}

export default Ingestion;