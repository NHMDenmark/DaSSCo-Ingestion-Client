import { createFormContext } from '@mantine/form';

export type JobRun = { name: string; success: boolean; value: any; error: string | null }

interface IngestionFormValues {
    workflow: string;
    workflowVersion: number;
    directoryPath: string;
    workstation: string;
    workstationNickname: string;
    institution: string;
    collection: string;
    pipeline: string;
    fileFormat: string;
    funding: string[];
    prepType: string;
    payloadType: string;
    imager: string;
    ingestor: string;
    otherDigitisers: string[];
    preIngestResults: JobRun[];
}

export const [IngestionFormProvider, useIngestionFormContext, useIngestionForm] = createFormContext<IngestionFormValues>();