import { useState } from 'react'

interface AttendanceProps {
  attendance: {
    info: Array<{ idDiscord: string; username: string; percentage: number }>
  }
  markAllAsFull: () => void
  handleAttendanceClick: (playerId: string, value: number) => void
}

export function Attendance({
  attendance,
  markAllAsFull,
  handleAttendanceClick,
}: AttendanceProps) {
  const [currentPage, setCurrentPage] = useState(1) // Estado para controlar a página atual
  const playersPerPage = 10 // Número de players por página

  // Função para obter a cor com base no percentual
  const getColorForPercentage = (percentage: number) => {
    if (percentage === 0) return 'bg-red-500 text-white'
    if (percentage === 100) return 'bg-green-500 text-white'
    return 'bg-yellow-500 text-white'
  }

  // Calcular os players da página atual
  const indexOfLastPlayer = currentPage * playersPerPage
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage
  const currentPlayers = attendance.info.slice(
    indexOfFirstPlayer,
    indexOfLastPlayer
  )

  // Calcular o número de linhas vazias necessárias
  const emptyRows = playersPerPage - currentPlayers.length

  // Calcular o número total de páginas
  const totalPages = Math.ceil(attendance.info.length / playersPerPage)

  // Função para mudar de página
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className='w-[95%] mx-auto mt-2 p-4'>
      <div className='flex flex-col items-center'>
        <table className='w-[50%] border-collapse'>
          <thead className='table-header-group'>
            <tr className='text-md bg-zinc-400 text-gray-700'>
              <th className='p-2 border'>Player</th>
              <th className='p-2 border flex items-center justify-center'>
                Attendance
                <button
                  className='ml-2 px-2 py-1 text-xs font-semibold border rounded bg-green-500 text-white hover:bg-green-600 transition'
                  onClick={markAllAsFull}
                >
                  100%
                </button>
              </th>
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {/* Renderizar players da página atual */}
            {currentPlayers.map((player) => (
              <tr key={player.idDiscord} className='border border-gray-300'>
                <td className='p-2 text-center'>{player.username}</td>
                <td className='p-2 text-center'>
                  <div className='flex gap-2 px-2 justify-center'>
                    <select
                      value={player.percentage}
                      onChange={(e) =>
                        handleAttendanceClick(
                          player.idDiscord,
                          Number(e.target.value)
                        )
                      }
                      className={`px-2 py-1 text-xs border rounded transition-colors ${getColorForPercentage(
                        player.percentage
                      )}`}
                    >
                      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                        (value) => (
                          <option
                            key={value}
                            value={value}
                            className='bg-white text-zinc-900'
                          >
                            {value}%
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </td>
              </tr>
            ))}

            {/* Renderizar linhas vazias */}
            {Array.from({ length: emptyRows }).map((_, index) => (
              <tr key={`empty-${index}`} className='border border-gray-300'>
                <td className='p-2 text-center'>&nbsp;</td>
                <td className='p-2 text-center'>
                  <div className='flex gap-2 px-2 justify-center'>
                    <select
                      disabled
                      className='px-2 py-1 text-xs border rounded bg-white text-zinc-900 opacity-50'
                    >
                      <option value=''>-</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Controles de paginação */}
        <div className='flex justify-center items-center gap-4 mt-4 w-[50%]'>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className='px-4 py-2 bg-zinc-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Previous
          </button>
          <span className='text-sm text-zinc-200'>
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='px-4 py-2 bg-zinc-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
