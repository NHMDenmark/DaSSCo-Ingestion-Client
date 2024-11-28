import { Center, Group, Select, Text } from '@mantine/core'
import { useIngestionFormContext } from '../ingestion.form.context'
import { useQuery } from 'react-query';
import { APIService } from '@renderer/services/APIService';
import CenterLoader from '@renderer/components/loader/CenterLoader';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface IMetadataFormProps {
  setDisabled: Dispatch<SetStateAction<boolean>>;
}


const MetadataForm = (props: IMetadataFormProps): JSX.Element => {

  const form = useIngestionFormContext();

  const { data, isLoading, isError } = useQuery('options', APIService.getOptions);

  useEffect(() => {
    if (isLoading || isError) {
      props.setDisabled(true);
    } else {
      props.setDisabled(false);
    }
  }, [isLoading, isError, props]);

  if(isLoading) {
    return <CenterLoader/>;
  }
    
  if(isError) {
    return <>
      <Center>
        <Text c="red">Something went wrong. The API service is most likely down.</Text>
      </Center>
    </>
  } 

  return (
    <Center>
      <Group maw={500} mt={2} gap="xl">
        <Select label="Workstation" data={data.workstations} allowDeselect={false} {...form.getInputProps('workstation')}/>
        <Select label="Institution" data={data.institutions} allowDeselect={false} {...form.getInputProps('institution')} />
        <Select label="Collection" data={data.collections} allowDeselect={false} {...form.getInputProps('collection')} />
        <Select label="Pipeline" data={data.pipelines} allowDeselect={false} {...form.getInputProps('pipeline')} />
        <Select label="File Format" data={data.file_format} allowDeselect={false} {...form.getInputProps('fileFormat')} />
        <Select label="Funding" data={data.funding} allowDeselect={false} {...form.getInputProps('funding')} />
        <Select
          label="Preparation Type"
          data={data.preparation_type}
          allowDeselect={false}
          {...form.getInputProps('prepType')}
        />

        <Select
          label="Payload Type"
          data={data.payload_type}
          allowDeselect={false}
          {...form.getInputProps('payloadType')}
        />
      </Group>
    </Center>
  )
}

export default MetadataForm
