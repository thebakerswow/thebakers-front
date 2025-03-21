import { useState } from 'react'
import { Pencil, UserPlus } from '@phosphor-icons/react'
import twwLogo from '../../../assets/baker-and-employees.png'
import { AddBuyer } from '../../../components/add-buyer'
import { EditRun } from '../../../components/edit-run'
import { useAuth } from '../../../context/auth-context'
import { RunData } from '../../../types/runs-interface'

interface RunInfoProps {
  run: RunData
  onBuyerAddedReload: () => void
  onRunEdit: () => void
}

export function RunInfo({ run, onBuyerAddedReload, onRunEdit }: RunInfoProps) {
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { userRoles } = useAuth() // Obtenha as roles do contexto

  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
  }

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  function handleOpenAddBuyer() {
    setIsAddBuyerOpen(true)
  }

  function handleCloseAddBuyer() {
    setIsAddBuyerOpen(false)
  }

  function convertFromEST(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    let adjustedHours = hours + 1 // Ajuste para BRT

    // Ajustar caso a conversão ultrapasse 24h
    if (adjustedHours === 24) {
      adjustedHours = 0 // Meia-noite
    }

    // Formatar para 12 horas
    const period = adjustedHours >= 12 ? 'PM' : 'AM'
    const formattedHours = adjustedHours % 12 || 12 // Converte 0 para 12 no formato 12h

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  function formatTo12HourEST(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number)

    const period = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12 // Converte 0 para 12 no formato 12h

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  return (
    <div className='m-4 flex gap-2 rounded-md'>
      <img className='w-[300px] rounded-md' src={twwLogo} alt='Run Cover' />
      <div className='rounded-md bg-zinc-300 p-4 text-black'>
        <h2 className='text-lg font-semibold'>Gold Collectors</h2>
        <table className='w-full table-auto'>
          <tbody>
            {run.sumPot?.map((item) =>
              item.sumPot !== 0 ? ( // Verifica se sumPot não é igual a zero
                <tr key={item.idDiscord}>
                  <td className='p-2'>{item.username}</td>
                  <td className='p-2'>
                    {Math.round(Number(item.sumPot)).toLocaleString('en-US')}
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>
      <div className='grid flex-1 grid-cols-4 rounded-md bg-gray-300 text-center text-zinc-900'>
        <div className='col-span-3 flex flex-col'>
          <h1 className='mb-3 mt-3 text-lg font-semibold'>
            {run.raid} {run.difficulty} @{' '}
            {run.time ? (
              <>
                {formatTo12HourEST(run.time)} EST{' '}
                {/* Exibe o horário original recebido do backend */}
                || {convertFromEST(run.time)} BRT
              </>
            ) : (
              <span>-</span>
            )}
          </h1>

          <div className='ml-24 mt-4 grid grid-cols-3 gap-4 text-start'>
            <p className='font-semibold text-yellow-500'>
              <span className='text-base font-bold text-zinc-900'>
                Loot Type:{' '}
              </span>
              {run.loot}
            </p>
            <p className='font-semibold text-red-500'>
              <span className='text-base font-bold text-zinc-900'>
                Max Buyers:{' '}
              </span>
              {run.maxBuyers}
            </p>
            <p>
              <span className='text-base font-bold'>
                Slots Available:{' '}
                <span className='font-normal'>{run.slotAvailable}</span>
              </span>
            </p>
            <p>
              <span className='text-base font-bold'>
                Backups: <span className='font-normal'>{run.backups}</span>
              </span>
            </p>
            <p>
              <span className='text-base font-bold'>Raid Leader(s): </span>{' '}
              {run.raidLeaders && run.raidLeaders.length > 0 ? (
                run.raidLeaders
                  .map((raidLeader) => raidLeader.username)
                  .join(', ')
              ) : (
                <span>-</span>
              )}
            </p>
            <p>
              <span className='text-base font-bold'>
                Gold Collected:{' '}
                <span className='font-normal'>
                  {Math.round(Number(run.actualPot)).toLocaleString('en-US')}
                </span>
              </span>
            </p>
          </div>
        </div>
        <div className='m-4 flex flex-col items-center justify-center gap-2'>
          <button
            className='flex w-full items-center justify-center gap-2 rounded-md bg-red-400 p-2 text-gray-100 hover:bg-red-500'
            onClick={handleOpenAddBuyer}
          >
            <UserPlus size={18} />
            Add Buyer
          </button>
          {/* Permissoes prefeito, chefe de cozinha, staff */}
          {hasRequiredRole([
            '1101231955120496650',
            '1244711458541928608',
            '1148721174088532040',
          ]) && (
            <button
              className='flex w-full items-center justify-center gap-2 rounded-md bg-red-400 p-2 text-gray-100 hover:bg-red-500'
              onClick={handleOpenEditModal}
            >
              <Pencil size={18} />
              Edit Raid
            </button>
          )}
        </div>
      </div>

      {isAddBuyerOpen && (
        <AddBuyer
          run={run}
          onClose={handleCloseAddBuyer}
          onBuyerAddedReload={onBuyerAddedReload}
        />
      )}
      {isEditModalOpen && (
        <EditRun
          key={run.id}
          run={run}
          onClose={handleCloseEditModal}
          onRunEdit={onRunEdit}
        />
      )}
    </div>
  )
}
