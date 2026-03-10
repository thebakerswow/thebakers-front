import { useState } from 'react'
import { Clock, Lock, LockOpen, UserPlus } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { AddBuyer } from '../../components/add-buyer'
import { useAuth } from '../../context/auth-context'
import { RunData } from '../../types/runs-interface'
import { ErrorDetails } from '../../components/error-display'
import { EditHistoryDialog } from '../../components/edit-history-dialog'
import { createSpecialRun } from '../../services/api/runs'
import { RUN_FLAG_QUERY_PARAM, RunScreenFlag } from '../../constants/run-flags'
import {
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@mui/material'
import { api } from '../../services/axiosConfig'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface SpecialRunInfoProps {
  run: RunData
  onBuyerAddedReload: () => void
  onRunEdit: () => void
  runScreen: RunScreenFlag
  detailsRoutePrefix: string
  onError?: (error: ErrorDetails) => void
  logoSrc?: string
}

export function SpecialRunInfo({
  run,
  onBuyerAddedReload,
  onRunEdit,
  runScreen,
  detailsRoutePrefix,
  onError,
  logoSrc,
}: SpecialRunInfoProps) {
  const navigate = useNavigate()
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [isRunLocked, setIsRunLocked] = useState(run.runIsLocked)
  const [isReplacingRun, setIsReplacingRun] = useState(false)
  const { userRoles } = useAuth()
  const [isEditHistoryOpen, setIsEditHistoryOpen] = useState(false)

  function hasPrefeitoTeamAccess(runData: RunData, roles: string[]): boolean {
    const isPrefeito = roles.includes(import.meta.env.VITE_TEAM_PREFEITO)
    if (!isPrefeito) return false
    return roles.includes(runData.idTeam)
  }

  const toggleRunLock = async () => {
    try {
      const response = await api.put(`/run/${run.id}/lock`, {
        isLocked: !isRunLocked,
      })
      if (response.status === 200) {
        setIsRunLocked(!isRunLocked)
        window.location.reload()
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        onError?.({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        onError?.({ message: 'Unexpected error', response: error })
      }
    }
  }

  const handleDeleteAndRecreateDay = async () => {
    const shouldProceed = window.confirm(
      'This is a test action. Delete current day and create a new one?'
    )
    if (!shouldProceed) return

    const runTypeByScreen: Record<RunScreenFlag, string> = {
      traditional: 'Traditional',
      keys: 'Keys',
      leveling: 'Leveling',
      pvp: 'PVP',
    }

    try {
      setIsReplacingRun(true)
      const today = format(new Date(), 'yyyy-MM-dd')

      await api.delete(`/run/${run.id}`, {
        params: {
          [RUN_FLAG_QUERY_PARAM]: runScreen,
        },
      })
      await createSpecialRun(today, runTypeByScreen[runScreen])

      const refreshedRunsResponse = await api.get('/run', {
        params: {
          date: today,
          [RUN_FLAG_QUERY_PARAM]: runScreen,
        },
      })

      const refreshedRuns = refreshedRunsResponse.data.info || []
      if (refreshedRuns.length > 0) {
        navigate(`${detailsRoutePrefix}/${refreshedRuns[0].id}`, { replace: true })
        return
      }

      onError?.({ message: 'No run found after recreation.' })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        onError?.({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        onError?.({ message: 'Unexpected error', response: error })
      }
    } finally {
      setIsReplacingRun(false)
    }
  }

  return (
    <div className='m-4 flex gap-2 rounded-md'>
      {logoSrc ? (
        <img
          className='min-h-[220px] min-w-[300px] max-w-[400px] rounded-md'
          src={logoSrc}
          alt='Run Cover'
        />
      ) : (
        <div className='flex min-h-[220px] min-w-[300px] max-w-[400px] items-center justify-center rounded-md bg-zinc-800 text-2xl font-bold text-white'>
          PVP
        </div>
      )}
      {run.sumPot?.some((item) => item.type === 'gold' && item.sumPot !== 0) && (
        <div className='min-w-[300px] max-w-[400px] flex-1 rounded-md bg-gray-100 p-4 text-center text-black'>
          <h2 className='text-lg font-semibold'>Gold Collectors</h2>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {run.sumPot
                  ?.filter((item) => item.type === 'gold' && item.sumPot !== 0)
                  .map((item) => (
                    <TableRow key={item.idDiscord} style={{ height: '20px' }}>
                      <TableCell style={{ padding: '10px' }}>{item.username}</TableCell>
                      <TableCell align='right' style={{ padding: '10px' }}>
                        {Math.round(Number(item.sumPot)).toLocaleString('en-US')}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      {run.sumPot?.some((item) => item.type === 'dolar' && item.sumPot !== 0) && (
        <div className='min-w-[300px] max-w-[400px] flex-1 rounded-md bg-gray-100 p-4 text-center text-black'>
          <h2 className='text-lg font-semibold'>Dolar Collectors</h2>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {run.sumPot
                  ?.filter((item) => item.type === 'dolar' && item.sumPot !== 0)
                  .map((item) => (
                    <TableRow key={item.idDiscord} style={{ height: '20px' }}>
                      <TableCell style={{ padding: '10px' }}>{item.username}</TableCell>
                      <TableCell align='right' style={{ padding: '10px' }}>
                        {Number(item.sumPot).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <Card
        className='grid flex-1 grid-cols-4 items-center text-left text-zinc-900'
        style={{ minWidth: '800px', backgroundColor: '#f3f4f6' }}
      >
        <CardContent className='col-span-3'>
          <div className='flex items-center justify-center gap-4 text-center'>
            {run.raidLeaders && run.raidLeaders.length > 0 && (
              <p className='text-left'>
                <span className='text-base font-bold'>Raid Leader: </span>
                {run.raidLeaders.map((raidLeader) => raidLeader.username).join(', ')}
              </p>
            )}
          </div>
        </CardContent>
        <CardContent className='m-4 flex flex-col items-center justify-center gap-2'>
          <Button
            variant='contained'
            startIcon={<UserPlus size={18} />}
            fullWidth
            onClick={() => setIsAddBuyerOpen(true)}
            disabled={isRunLocked}
            sx={{
              backgroundColor: isRunLocked ? 'rgb(209, 213, 219)' : 'rgb(147, 51, 234)',
              '&:hover': {
                backgroundColor: isRunLocked ? 'rgb(209, 213, 219)' : 'rgb(168, 85, 247)',
              },
            }}
          >
            Add Buyer
          </Button>
          {hasPrefeitoTeamAccess(run, userRoles) ||
          userRoles.includes(import.meta.env.VITE_TEAM_CHEFE) ? (
            <>
              <Button
                variant='contained'
                startIcon={<Clock size={18} />}
                fullWidth
                onClick={() => setIsEditHistoryOpen(true)}
                sx={{
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                }}
              >
                History
              </Button>
              <Button
                variant='contained'
                startIcon={isRunLocked ? <LockOpen size={18} /> : <Lock size={18} />}
                fullWidth
                onClick={toggleRunLock}
                sx={{
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                }}
              >
                {isRunLocked ? 'Unlock Day' : 'Lock Day'}
              </Button>
              <Button
                variant='contained'
                fullWidth
                disabled={isReplacingRun}
                onClick={handleDeleteAndRecreateDay}
                sx={{
                  backgroundColor: 'rgb(185, 28, 28)',
                  '&:hover': { backgroundColor: 'rgb(220, 38, 38)' },
                }}
              >
                {isReplacingRun ? 'Recreating...' : 'Delete Day (TEST)'}
              </Button>
            </>
          ) : (
            isRunLocked && (
              <p className='text-center font-semibold text-purple-500'>
                This day is currently locked. You do not have permission to unlock it.
              </p>
            )
          )}
        </CardContent>
      </Card>

      {isAddBuyerOpen && (
        <AddBuyer
          run={run}
          onClose={() => setIsAddBuyerOpen(false)}
          onBuyerAddedReload={onBuyerAddedReload}
          onError={onError}
        />
      )}
      {isEditHistoryOpen && (
        <EditHistoryDialog
          open={isEditHistoryOpen}
          onClose={() => setIsEditHistoryOpen(false)}
          idRun={Number(run.id)}
        />
      )}
    </div>
  )
}
