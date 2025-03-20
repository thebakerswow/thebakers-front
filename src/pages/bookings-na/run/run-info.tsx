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

    // Formatar para 12 horas
    const period = adjustedHours >= 12 ? 'pm' : 'am'
    const formattedHours = adjustedHours % 12 || 12 // Converte 0 para 12 no formato 12h

    return `${formattedHours}:${minutes.toString().padStart(2, '0')}${period}`
  }

  function formatTo12HourEST(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number)

    const period = hours >= 12 ? 'pm' : 'am'
    const formattedHours = hours % 12 || 12 // Converte 0 para 12 no formato 12h

    return `${formattedHours}:${minutes.toString().padStart(2, '0')}${period}`
  }

  return (
    <div className='flex m-4 gap-2 rounded-md'>
      <img className='w-[300px] rounded-md' src={twwLogo} alt='Run Cover' />
      <div className='bg-zinc-300 p-4 text-black rounded-md'>
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
      <div className='grid grid-cols-4 flex-1 text-center bg-gray-300 rounded-md text-zinc-900'>
        <div className='col-span-3 flex flex-col'>
          <h1 className='font-semibold text-lg mt-3 mb-3'>
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

          <div className='grid grid-cols-3 gap-4 mt-4 text-start ml-24'>
            <p className='text-yellow-500 font-semibold'>
              <span className='font-bold text-base text-zinc-900'>
                Loot Type:{' '}
              </span>
              {run.loot}
            </p>
            <p className='text-red-500 font-semibold'>
              <span className='font-bold text-base text-zinc-900'>
                Max Buyers:{' '}
              </span>
              {run.maxBuyers}
            </p>
            <p>
              <span className='font-bold text-base'>
                Slots Available:{' '}
                <span className='font-normal'>{run.slotAvailable}</span>
              </span>
            </p>
            <p>
              <span className='font-bold text-base'>
                Backups: <span className='font-normal'>{run.backups}</span>
              </span>
            </p>
            <p>
              <span className='font-bold text-base'>Raid Leader(s): </span>{' '}
              {run.raidLeaders && run.raidLeaders.length > 0 ? (
                run.raidLeaders
                  .map((raidLeader) => raidLeader.username)
                  .join(', ')
              ) : (
                <span>-</span>
              )}
            </p>
            <p>
              <span className='font-bold text-base'>
                Gold Collected:{' '}
                <span className='font-normal'>
                  {Math.round(Number(run.actualPot)).toLocaleString('en-US')}
                </span>
              </span>
            </p>
          </div>
        </div>
        <div className='flex flex-col gap-2 m-4 justify-center items-center'>
          <button
            className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 w-full justify-center'
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
              className='flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 w-full justify-center'
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
