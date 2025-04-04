import { Center, Group, MultiSelect, Select, Text, TextInput } from '@mantine/core'
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
  { key: 'funding', label: 'Funding' },
  { key: 'prepType', label: 'Preparation Type' },
  { key: 'payloadType', label: 'Payload Type' }
]

const MetadataForm = (props: IMetadataFormProps): JSX.Element => {
  const form = useIngestionFormContext()
  const { authenticated, getDigitisers } = useKeycloakAdmin()
  const [digitisers, setDigitisers] = useState<UserRepresentation[]>([])

  const { data, isLoading, isError } = useQuery('options', APIService.getOptions)

  const digitiserOptions = useMemo(() => {
    const options = digitisers.map((digitiser: UserRepresentation) =>
      `${digitiser.firstName || ''} ${digitiser.lastName || ''}`.trim()
    )

    const currentImager = form.getValues().imager
    if (currentImager && !options.some((option) => option === currentImager)) {
      options.push(currentImager)
    }

    return options
  }, [digitisers, form.getValues().imager])

  const onWorkstationChange = (workstationName: string | null) => {
    const selectedWorkstation = data?.workstations?.find((w: any) => w.name === workstationName)

    form.setValues({
      workstation: selectedWorkstation.name,
      institution: selectedWorkstation.institution,
      collection: selectedWorkstation.collection_name,
      pipeline: selectedWorkstation.pipeline_name,
      fileFormat: selectedWorkstation.file_format,
      funding: selectedWorkstation.funding,
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
      console.log(digitisers)
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
          data={data?.workstations.map((w: any) => w.name)}
          allowDeselect={false}
          {...form.getInputProps('workstation')}
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
      </Group>
    </Center>
  )
}

export default MetadataForm
