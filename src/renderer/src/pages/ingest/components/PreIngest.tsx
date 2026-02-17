import { APIService } from '@renderer/services/APIService'
import { useEffect, useMemo, useState } from 'react'
import { JobRun, useIngestionFormContext } from '../ingestion.form.context'
import { Accordion, Button, Group, Stack, Title } from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import CenterLoader from '@renderer/components/loader/CenterLoader'
import JobItem from '@renderer/components/collapse/JobItem'

interface PreIngestProps {
  onJobsComplete: (success: boolean) => void
}

const PreIngest = ({ onJobsComplete }: PreIngestProps) => {
  const form = useIngestionFormContext()
  const workflow = form.getValues().workflow
  const version = form.getValues().workflowVersion
  const workstation = form.getValues().workstation

  const [jobResults, setJobResults] = useState<JobRun[]>(form.getValues().preIngestResults || [])

  const { data, isPending } = useQuery({
    queryKey: ['stage:preingest', workflow, version],
    queryFn: () => {
      return APIService.getWorkflowStage(workflow, version, 'pre_ingest')
    }
  })

  const {
    mutate: startPreIngest,
    isPending: isStarting,
    isSuccess: jobsCompleted
  } = useMutation({
    mutationKey: ['preingest:start', workflow],
    mutationFn: async () => {
      const sessionId = await APIService.createPreIngestSession(workflow, version, workstation)

      const requiredFields = Array.from(
        new Set(data.jobs.flatMap((j: any) => j.required_inputs as string[]))
      )

      for (const fieldName of requiredFields) {
        const value = await getData(fieldName as string)
        await APIService.addSessionData(sessionId, fieldName as string, value)
      }

      return APIService.startPreIngest(sessionId)
    },
    onSuccess: (results) => {
      setJobResults(results)
      console.log(results);
      form.setFieldValue('preIngestResults', results)

      const allSuccess = results.every((job: JobRun) => job.success)
      onJobsComplete(allSuccess)
    },
    onError: (error) => {
      console.error('Pre-ingest execution failed:', error)
      onJobsComplete(false)
    },
    retry: 0
  })

  const getData = async (fieldName: string): Promise<any> => {
    switch (fieldName) {
      case 'files': {
        const directory = form.getValues().directoryPath
        return (await window.context.readFiles(directory)).map((v) => v.name)
      }
    }
  }

  const resultsByName = useMemo(() => {
    const map: Record<string, JobRun> = {}
    ;(jobResults ?? []).forEach((r) => {
      map[r.name] = r
    })
    return map
  }, [jobResults])

  if (isPending) return <CenterLoader />

  return (
    <Stack gap="md">
      <Group mb={10} mt={40} justify="space-between">
        <Title size={24}>Jobs</Title>
        {!(jobResults.length > 0) && (
          <Button
            color="orange"
            size="xs"
            loading={isStarting}
            disabled={!data}
            onClick={() => startPreIngest()}
          >
            Run Jobs
          </Button>
        )}
      </Group>

      <Accordion>
        {data.jobs.map(({ name }: { name: string }) => {
          const res = resultsByName[name]
          const status: 'success' | 'failed' | 'pending' = res
            ? res.success
              ? 'success'
              : 'failed'
            : 'pending'
          const summary = res ? (res.success ? 'Completed' : (res.error ?? 'Failed')) : 'No details'

          return <JobItem key={name} jobName={name} status={status} summary={summary} />
        })}
      </Accordion>
    </Stack>
  )
}

export default PreIngest
