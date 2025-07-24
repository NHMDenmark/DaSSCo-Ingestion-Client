import { createFormContext } from '@mantine/form';

interface IngestionFormValues {
    workflow: string;
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
}

export const [IngestionFormProvider, useIngestionFormContext, useIngestionForm] = createFormContext<IngestionFormValues>();