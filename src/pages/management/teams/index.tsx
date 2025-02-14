import { useState, useEffect, useRef } from 'react'
import { teamData } from '../../../assets/team-data'
import { DotsThreeVertical } from '@phosphor-icons/react'

export function TeamsManagement() {
  const columns = [
    teamData.filter((row) => row.team === '1'),
    teamData.filter((row) => row.team === '2'),
    teamData.filter((row) => row.team === '3'),
    teamData.filter((row) => row.team === 'advertiser'),
  ]

  // Gerenciar o estado para saber qual menu suspenso está aberto
  const [openMenu, setOpenMenu] = useState<{
    rowIndex: number
    teamIndex: number
  } | null>(null)

  const menuRef = useRef<HTMLDivElement>(null) // Referência para o menu

  const handleEdit = (player: string, discord: string) => {
    alert(`Editar jogador: ${player} com Discord ID: ${discord}`)
  }

  const handleDelete = (player: string, discord: string) => {
    alert(`Excluir jogador: ${player} com Discord ID: ${discord}`)
  }

  const toggleMenu = (teamIndex: number, rowIndex: number) => {
    // Se já estiver aberto, fechar; caso contrário, abrir
    setOpenMenu(
      openMenu?.teamIndex === teamIndex && openMenu?.rowIndex === rowIndex
        ? null
        : { teamIndex, rowIndex }
    )
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpenMenu(null)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div
      className='bg-zinc-700 text-gray-100 absolute inset-0 flex flex-col
      rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin'
    >
      <div className='m-4 flex gap-2 items-center'>
        Add Player:
        <input
          className='rounded-md text-zinc-700 pl-2'
          placeholder='Player'
          type='text'
        />
        <input
          className='rounded-md text-zinc-700 pl-2'
          placeholder='Discord'
          type='text'
        />
        <select className='rounded-md text-zinc-700 pl-2 p-0.5' name='select'>
          <option value='team1'>Team 1</option>
          <option value='team2'>Team 2</option>
          <option value='team3'>Team 3</option>
          <option value='advertiser'>Advertiser</option>
        </select>
        <button className='bg-red-400 text-gray-100 hover:bg-red-500 shadow-lg rounded-md p-1 text-sm font-normal px-2'>
          ADD
        </button>
      </div>

      <table className='min-w-full border-collapse'>
        <thead className='table-header-group'>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            <th className='p-2 border border-r-black' colSpan={3}>
              Team 1
            </th>
            <th className='p-2 border border-r-black' colSpan={3}>
              Team 2
            </th>
            <th className='p-2 border' colSpan={3}>
              Team 3
            </th>
            <th className='p-2 border' colSpan={3}>
              Advertisers
            </th>
          </tr>
          <tr className='text-md bg-zinc-300 text-gray-800'>
            <th className='p-2 border w-1/12'>Player</th>
            <th className='p-2 border w-1/12'>Discord</th>
            <th className='p-2 border border-r-black w-1/12'>Actions</th>
            <th className='p-2 border w-1/12'>Player</th>
            <th className='p-2 border w-1/12'>Discord</th>
            <th className='p-2 border border-r-black w-1/12'>Actions</th>
            <th className='p-2 border w-1/12'>Player</th>
            <th className='p-2 border w-1/12'>Discord</th>
            <th className='p-2 border border-r-black w-1/12'>Actions</th>
            <th className='p-2 border w-1/12'>Player</th>
            <th className='p-2 border w-1/12'>Discord</th>
            <th className='p-2 border w-1/12'>Actions</th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {Array.from(
            {
              length: Math.max(
                ...columns.map((teamData) => teamData.length),
                1
              ),
            },
            (_, rowIndex) => (
              <tr
                className={`text-center ${
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-zinc-200'
                }`}
                key={`row-${rowIndex}`}
              >
                {columns.map((teamData, teamIndex) =>
                  teamData[rowIndex] ? (
                    <>
                      <td
                        className='p-2 border border-b-black'
                        key={`player-${teamIndex}-${rowIndex}`}
                      >
                        {teamData[rowIndex].player}
                      </td>
                      <td
                        className='p-2 border border-b-black'
                        key={`discord-${teamIndex}-${rowIndex}`}
                      >
                        {teamData[rowIndex].discord}
                      </td>
                      <td
                        className='relative p-2 border border-b-black border-r-black'
                        key={`actions-${teamIndex}-${rowIndex}`}
                      >
                        <button
                          className='text-white px-2 py-1 rounded cursor-pointer relative z-10'
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMenu(teamIndex, rowIndex)
                          }}
                        >
                          <DotsThreeVertical color='black' weight='bold' />
                        </button>
                        {openMenu?.teamIndex === teamIndex &&
                          openMenu?.rowIndex === rowIndex && (
                            <div
                              className='absolute right-0 mt-2 bg-white border shadow-lg rounded-lg w-32 z-50'
                              ref={menuRef}
                            >
                              <button
                                className='block px-3 py-2 text-sm hover:bg-gray-200 w-full'
                                onClick={() =>
                                  handleEdit(
                                    teamData[rowIndex].player,
                                    teamData[rowIndex].discord
                                  )
                                }
                              >
                                Edit
                              </button>
                              <button
                                className='block px-3 py-2 text-sm hover:bg-gray-200 w-full'
                                onClick={() =>
                                  handleDelete(
                                    teamData[rowIndex].player,
                                    teamData[rowIndex].discord
                                  )
                                }
                              >
                                Delete
                              </button>
                            </div>
                          )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        className='p-2 border border-b-black'
                        key={`empty-player-${teamIndex}-${rowIndex}`}
                      >
                        -
                      </td>
                      <td
                        className='p-2 border border-b-black'
                        key={`empty-discord-${teamIndex}-${rowIndex}`}
                      >
                        -
                      </td>
                      <td
                        className='p-2 border border-b-black'
                        key={`empty-actions-${teamIndex}-${rowIndex}`}
                      >
                        -
                      </td>
                    </>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}
