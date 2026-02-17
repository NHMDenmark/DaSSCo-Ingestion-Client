import { Accordion, Badge, Group, Text } from '@mantine/core'

interface JobItemProps {
  jobName: string
  status: 'success' | 'failed' | 'pending'
  summary?: string
}

const JobItem = ({ jobName, status, summary }: JobItemProps) => {
  const isSuccess = status === 'success'
  const isFailed = status === 'failed'
  const isPending = status === 'pending'
  const color = isSuccess ? 'green' : isFailed ? 'red' : 'orange'

  const controlStyle = color
    ? {
        background: `var(--mantine-color-${color}-0)`,
        borderLeft: `3px solid var(--mantine-color-${color}-6)`
      }
    : undefined

  const panelStyle = color
    ? {
        background: `var(--mantine-color-${color}-1)`,
        borderLeft: `3px solid var(--mantine-color-${color}-6)`
      }
    : undefined

  return (
    <Accordion.Item value={jobName} >
      <Accordion.Control style={controlStyle}>
        <Group justify="space-between" wrap="nowrap" style={{ width: '100%' }}>
          <Group gap="sm" wrap="nowrap">
            <Badge {...(color ? { color } : {})}>{status}</Badge>
            <Text fw={600} truncate="end" maw={520} title={jobName}>
              {jobName}
            </Text>
          </Group>
        </Group>
      </Accordion.Control>
      {!isPending && <Accordion.Panel style={panelStyle}>{summary}</Accordion.Panel>}
    </Accordion.Item>
  )
}
export default JobItem