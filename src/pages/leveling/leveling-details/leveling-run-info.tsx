import { useState } from 'react'
import { Lock, LockOpen, UserPlus } from '@phosphor-icons/react'
import levelingLogo from '../../../assets/leveling.png'
import { AddBuyer } from '../../../components/add-buyer'
import { useAuth } from '../../../context/auth-context'
import { RunData } from '../../../types/runs-interface'
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
import { api } from '../../../services/axiosConfig'

interface LevelingRunInfoProps {
  run: RunData
  onBuyerAddedReload: () => void
  onRunEdit: () => void
  attendanceAccessDenied: boolean
}

export function LevelingRunInfo({
  run,
  onBuyerAddedReload,
  attendanceAccessDenied,
}: LevelingRunInfoProps) {
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [isRunLocked, setIsRunLocked] = useState(run.runIsLocked) // Assume `isLocked` is part of `run`
  const { userRoles } = useAuth() // Obtenha as roles do contexto

  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
  }



  function handleOpenAddBuyer() {
    setIsAddBuyerOpen(true)
  }

  function handleCloseAddBuyer() {
    setIsAddBuyerOpen(false)
  }

  const toggleRunLock = async () => {
    try {
      const response = await api.put(`/run/${run.id}/lock`, {
        isLocked: !isRunLocked,
      })
      if (response.status === 200) {
        setIsRunLocked(!isRunLocked)
        window.location.reload() // Reload the page after toggling the lock
      }
    } catch (error) {
      console.error('Failed to toggle run lock:', error)
    }
  }

  return (
    <div className='m-4 flex gap-2 rounded-md'>
      <img
        className='min-h-[220px] min-w-[300px] max-w-[400px] rounded-md'
        src={levelingLogo}
        alt='Run Cover'
      />
      {run.sumPot?.some(
        (item) => item.type === 'gold' && item.sumPot !== 0
      ) && (
        <div className='min-w-[300px] max-w-[400px] flex-1 rounded-md bg-gray-100 p-4 text-center text-black'>
          <h2 className='text-lg font-semibold'>Gold Collectors</h2>
          <TableContainer component={Paper}>
            {!attendanceAccessDenied && (
              <Table>
                <TableBody>
                  {run.sumPot
                    ?.filter(
                      (item) => item.type === 'gold' && item.sumPot !== 0
                    )
                    .map((item) => (
                      <TableRow key={item.idDiscord} style={{ height: '20px' }}>
                        <TableCell style={{ padding: '10px' }}>
                          {item.username}
                        </TableCell>
                        <TableCell align='right' style={{ padding: '10px' }}>
                          {Math.round(Number(item.sumPot)).toLocaleString(
                            'en-US'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </div>
      )}
      {/* Exibe Dolar Collectors apenas se houver pelo menos um item do tipo dolar */}
      {run.sumPot?.some(
        (item) => item.type === 'dolar' && item.sumPot !== 0
      ) && (
        <div className='min-w-[300px] max-w-[400px] flex-1 rounded-md bg-gray-100 p-4 text-center text-black'>
          <h2 className='text-lg font-semibold'>Dolar Collectors</h2>
          <TableContainer component={Paper}>
            {!attendanceAccessDenied && (
              <Table>
                <TableBody>
                  {run.sumPot
                    ?.filter(
                      (item) => item.type === 'dolar' && item.sumPot !== 0
                    )
                    .map((item) => (
                      <TableRow key={item.idDiscord} style={{ height: '20px' }}>
                        <TableCell style={{ padding: '10px' }}>
                          {item.username}
                        </TableCell>
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
            )}
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
                {run.raidLeaders
                  .map((raidLeader) => raidLeader.username)
                  .join(', ')}
              </p>
            )}
          </div>
        </CardContent>
        <CardContent className='m-4 flex flex-col items-center justify-center gap-2'>
          <Button
            variant='contained'
            startIcon={<UserPlus size={18} />}
            fullWidth
            onClick={handleOpenAddBuyer}
            disabled={isRunLocked} // Disable button if run is locked
            sx={{
              backgroundColor: isRunLocked
                ? 'rgb(209, 213, 219)'
                : 'rgb(147, 51, 234)', // Gray if disabled
              '&:hover': {
                backgroundColor: isRunLocked
                  ? 'rgb(209, 213, 219)'
                  : 'rgb(168, 85, 247)', // Gray if disabled
              },
            }}
          >
            Add Buyer
          </Button>
          {/* Permissoes prefeito, chefe de cozinha, staff */}
          {hasRequiredRole([
            import.meta.env.VITE_TEAM_PREFEITO,
            import.meta.env.VITE_TEAM_CHEFE,
            import.meta.env.VITE_TEAM_STAFF,
          ]) ? (
            <>
             
              <Button
                variant='contained'
                startIcon={
                  isRunLocked ? <LockOpen size={18} /> : <Lock size={18} />
                }
                fullWidth
                onClick={toggleRunLock}
                sx={{
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': {
                    backgroundColor: 'rgb(168, 85, 247)',
                  },
                }}
              >
                {isRunLocked ? 'Unlock Day' : 'Lock Day'}
              </Button>
            </>
          ) : (
            isRunLocked && (
              <p className='text-center font-semibold text-purple-500'>
                This day is currently locked. You do not have permission to
                unlock it.
              </p>
            )
          )}
        </CardContent>
      </Card>

      {isAddBuyerOpen && (
        <AddBuyer
          run={run}
          onClose={handleCloseAddBuyer}
          onBuyerAddedReload={onBuyerAddedReload}
        />
      )}
    </div>
  )
}
