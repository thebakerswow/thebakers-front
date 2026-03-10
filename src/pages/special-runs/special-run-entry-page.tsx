import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { api } from '../../services/axiosConfig'
import { RUN_FLAG_QUERY_PARAM, RunScreenFlag } from '../../constants/run-flags'
import { createSpecialRun } from '../../services/api/runs'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import axios from 'axios'

interface SpecialRunEntryPageProps {
  runScreen: RunScreenFlag
  detailsRoutePrefix: string
  runType: string
}

export function SpecialRunEntryPage({
  runScreen,
  detailsRoutePrefix,
  runType,
}: SpecialRunEntryPageProps) {
  const navigate = useNavigate()
  const [error, setError] = useState<ErrorDetails | null>(null)

  useEffect(() => {
    const openFirstRun = async () => {
      const today = format(new Date(), 'yyyy-MM-dd')

      try {
        const response = await api.get('/run', {
          params: {
            date: today,
            [RUN_FLAG_QUERY_PARAM]: runScreen,
          },
        })

        let runs = response.data.info || []

        if (runs.length === 0) {
          await createSpecialRun(today, runType)
          const refreshed = await api.get('/run', {
            params: {
              date: today,
              [RUN_FLAG_QUERY_PARAM]: runScreen,
            },
          })
          runs = refreshed.data.info || []
        }

        if (runs.length > 0) {
          navigate(`${detailsRoutePrefix}/${runs[0].id}`, { replace: true })
        }
      } catch (err) {
        const errorDetails = axios.isAxiosError(err)
          ? {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
            }
          : { message: 'Unexpected error', response: err }
        setError(errorDetails)
      }
    }

    openFirstRun()
  }, [navigate, detailsRoutePrefix, runScreen, runType])

  return (
    <div className='flex h-full w-full items-center justify-center'>
      {error ? (
        <ErrorComponent error={error} onClose={() => setError(null)} />
      ) : (
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-purple-400' />
      )}
    </div>
  )
}
