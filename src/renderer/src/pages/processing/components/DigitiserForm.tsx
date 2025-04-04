import { Center, Group, MultiSelect, Select, Text, TextInput } from '@mantine/core'
import { useIngestionFormContext } from '../ingestion.form.context'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useKeycloakAdmin } from '@renderer/hooks/useKeycloakAdmin'
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation'

interface IDigitserForm {
  setDisabled: Dispatch<SetStateAction<boolean>>
}

const DigitiserForm = (props: IDigitserForm): JSX.Element => {
  const form = useIngestionFormContext()
  const { authenticated, getDigitisers } = useKeycloakAdmin()
  const [digitisers, setDigitisers] = useState<UserRepresentation[]>([])

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

  useEffect(() => {
    props.setDisabled(false);
    if (authenticated) {
      const fetchDigiters = async () => {
        const digitisers = await getDigitisers()
        setDigitisers(digitisers)
      }
      console.log(digitisers)
      fetchDigiters()
    }
  }, [authenticated])

  return (
    <Center>
      <Group w={230} mt={20} gap="xl">
        <Select
          w={230}
          label="Imager"
          description="The digitiser who took the image"
          data={digitiserOptions}
          allowDeselect={false}
          {...form.getInputProps('imager')}
        />

        <MultiSelect
          w={230}
          description="All the digitisers that participated in the digitisation process - registered users only"
          label="Other Digitisers
          "
          data={digitiserOptions}
          {...form.getInputProps('otherDigitisers')}
        />

        <TextInput
          w={230}
          label="Ingestor"
          description="Automatically populated"
          {...form.getInputProps('ingestor')}
          disabled
        />
      </Group>
    </Center>
  )
}

export default DigitiserForm
