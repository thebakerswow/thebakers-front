import { useEffect, useState } from 'react'
import { getRunsWithoutAttendanceInfo } from '../services/adminApi'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { getApiErrorMessage } from '../../../../utils/apiErrorHandler'
import { useAdaptivePolling } from '../hooks/useAdaptivePolling'

import type { RunWithoutAttendance } from '../types/admin'

function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/\S+/)
  return match ? match[0] : null
}

export default function RunWithoutAttendanceTable() {
  const [runs, setRuns] = useState<RunWithoutAttendance[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRuns = async () => {
    try {
      const runsInfo = await getRunsWithoutAttendanceInfo()
      setRuns(runsInfo)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch runs without attendance.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRuns()
  }, [])

  useAdaptivePolling({
    onPoll: fetchRuns,
    activeDelayMs: 300000,
    inactiveDelayMs: 600000,
  })

  return (
    <div className='mt-4 flex max-h-[300px] flex-col'>
      <div className='top-0 flex justify-center rounded-t-xl border border-b-0 border-white/10 bg-white/[0.05] p-3 text-white'>
        <h3 className='text-base font-semibold'>Runs Without Attendance</h3>
      </div>
      <div className='overflow-auto rounded-b-xl border border-white/10 bg-white/[0.03] text-white'>
        <table className='w-full border-collapse'>
          <thead className='sticky top-0 bg-white/[0.05] text-xs uppercase text-neutral-300'>
            <tr>
              <th className='border border-white/10 p-2 text-center'>Link</th>
              <th className='border border-white/10 p-2 text-center'>Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={2} className='border border-white/10 p-3 text-center text-neutral-400'>
                  <div className='flex flex-col items-center gap-2'>
                    <LoadingSpinner size='sm' label='Loading runs' />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={2} className='border border-white/10 p-3 text-center text-red-300'>
                  {error}
                </td>
              </tr>
            ) : (
              runs?.map((run, index) => {
                const url = extractUrl(run.text)
                return (
                  <tr key={index} className='border-b border-white/5 odd:bg-white/[0.02]'>
                    <td className='border border-white/10 p-2 text-center'>
                      {url ? (
                        <a
                          href={url}
                          target='_blank'
                          rel='noopener noreferrer'
                          style={{
                            color: '#c084fc',
                            textDecoration: 'underline',
                          }}
                        >
                          {url}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className='border border-white/10 p-2 text-center'>{run.date}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
