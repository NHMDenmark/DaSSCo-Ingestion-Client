import { createFormContext } from '@mantine/form';

interface IngestionFormValues {
    directoryPath: string;
    workstation: string;
    institution: string;
    collection: string;
    pipeline: string;
    fileFormat: string;
    funding: string;
    prepType: string;
    payloadType: string;
    digitiser: string;
}

export const [IngestionFormProvider, useIngestionFormContext, useIngestionForm] = createFormContext<IngestionFormValues>();