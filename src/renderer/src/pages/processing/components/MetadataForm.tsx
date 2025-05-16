import { Center, Group, Select, TagsInput, Text, TextInput } from '@mantine/core'
import { useIngestionFormContext } from '../ingestion.form.context'
import { useQuery } from 'react-query'
import { APIService } from '@renderer/services/APIService'
import CenterLoader from '@renderer/components/loader/CenterLoader'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useKeycloakAdmin } from '@renderer/hooks/useKeycloakAdmin'
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation'

interface IMetadataFormProps {
  setDisabled: Dispatch<SetStateAction<boolean>>
}

const metadataFields = [
  { key: 'institution', label: 'Institution' },
  { key: 'collection', label: 'Collection' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'fileFormat', label: 'File Format' },
  { key: 'prepType', label: 'Preparation Type' },
  { key: 'payloadType', label: 'Payload Type' }
]

const MetadataForm = (props: IMetadataFormProps): JSX.Element => {
  const form = useIngestionFormContext()
  const { authenticated, getDigitisers } = useKeycloakAdmin()
  const [digitisers, setDigitisers] = useState<UserRepresentation[]>([])

  const { data, isLoading, isError } = useQuery('options', APIService.getOptions)

  const onWorkstationChange = (workstationName: string | null) => {
    const selectedWorkstation = data?.workstations?.find((w: any) => w.nickname === workstationName)

    form.setValues({
      workstationNickname: selectedWorkstation.nickname,
      workstation: selectedWorkstation.name,
      institution: selectedWorkstation.institution,
      collection: selectedWorkstation.collection_name,
      pipeline: selectedWorkstation.pipeline_name,
      fileFormat: selectedWorkstation.file_format,
      prepType: selectedWorkstation.preparation_type,
      payloadType: selectedWorkstation.payload_type
    })
  }

  useEffect(() => {
    if (authenticated) {
      const fetchDigiters = async () => {
        const digitisers = await getDigitisers()
        setDigitisers(digitisers)
      }
      fetchDigiters()
    }
  }, [authenticated])

  useEffect(() => {
    if (isLoading || isError) {
      props.setDisabled(true)
    } else {
      props.setDisabled(false)
    }
  }, [isLoading, isError, props])

  if (isLoading) {
    return <CenterLoader />
  }

  if (isError) {
    return (
      <>
        <Center>
          <Text c="red">Something went wrong. The API service is most likely down.</Text>
        </Center>
      </>
    )
  }

  return (
    <Center>
      <Group maw={500} mt={2} gap="xl">
        <Select
          w={230}
          label="Workstation"
          data={data?.workstations.map((w: any) => w.nickname)}
          allowDeselect={false}
          {...form.getInputProps('workstationNickname')}
          onChange={onWorkstationChange}
        />

        {metadataFields.map(({ key, label }) => (
          <TextInput
            w={230}
            key={form.key(key)}
            label={label}
            disabled
            {...form.getInputProps(key)}
          />
        ))}

        <TagsInput label="Funding" {...form.getInputProps('funding')} />
      </Group>
    </Center>
  )
}

export default MetadataForm
