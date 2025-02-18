import { useState } from 'react'
import { Pencil, UserPlus } from '@phosphor-icons/react'
import twwLogo from '../../../assets/baker-and-employees.png'
import { RunData } from './index'
import { AddBuyer } from '../../../components/add-buyer'
import { EditRun } from '../../../components/edit-run'
import { useAuth } from '../../../context/auth-context' // Importe o hook de autenticação

interface RunInfoProps {
  run: RunData
  onBuyerAddedReload: () => void
}

export function RunInfo({ run, onBuyerAddedReload }: RunInfoProps) {
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

  const handleRunAddedReload = () => {
    // Aqui você pode colocar a lógica para recarregar os dados, caso necessário
    console.log('Run adicionada. Recarregue os dados aqui.')
  }

  function handleOpenAddBuyer() {
    setIsAddBuyerOpen(true)
  }

  function handleCloseAddBuyer() {
    setIsAddBuyerOpen(false)
  }

  return (
    <div className='flex m-4 gap-4 rounded-md'>
      <img className='w-[400px] rounded-md' src={twwLogo} alt='Run Cover' />
      <div className='grid grid-cols-4 flex-1 text-center bg-gray-300 rounded-md text-zinc-900'>
        <div className='col-span-3 flex flex-col'>
          <h1 className='font-semibold text-lg mt-3 mb-3'>
            {run.raid} {run.difficulty} @ {run.time}
          </h1>
          <div className='grid grid-cols-3 gap-4 mt-4 text-start ml-24'>
            <p>
              <span className='font-bold text-base'>Raid Id: </span>
              {run.id}
            </p>
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
              <span className='font-bold text-base'>Slots Available: </span>
            </p>
            <p>
              <span className='font-bold text-base'>Backups: </span>
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
              <span className='font-bold text-base'>Gold Collector: </span>
              {run.goldCollector}
            </p>
            <p>
              <span className='font-bold text-base'>Potential Pot: </span>
            </p>
            <p>
              <span className='font-bold text-base'>Actual Pot: </span>{' '}
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
          onRunAddedReload={handleRunAddedReload}
        />
      )}
    </div>
  )
}
