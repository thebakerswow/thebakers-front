import { teamData } from '../../../assets/team-data'

export function TeamsManagement() {
  const columns = [
    teamData.filter((row) => row.team === '1'),
    teamData.filter((row) => row.team === '2'),
    teamData.filter((row) => row.team === '3'),
    teamData.filter((row) => row.team === 'advertiser'),
  ]

  return (
    <div
      className='bg-zinc-700 text-gray-100 absolute inset-0 flex flex-col
      rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin'
    >
      <table className='min-w-full border-collapse'>
        <thead className='table-header-group'>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            <th className='p-2 border border-r-black' colSpan={2}>
              Team 1
            </th>
            <th className='p-2 border border-r-black' colSpan={2}>
              Team 2
            </th>
            <th className='p-2 border' colSpan={2}>
              Team 3
            </th>
            <th className='p-2 border' colSpan={2}>
              Advertisers
            </th>
          </tr>
          <tr className='text-md bg-zinc-300 text-gray-800'>
            <th className='p-2 border w-1/8'>Player</th>
            <th className='p-2 border w-1/8'>Discord</th>
            <th className='p-2 border w-1/8'>Player</th>
            <th className='p-2 border w-1/8'>Discord</th>
            <th className='p-2 border w-1/8'>Player</th>
            <th className='p-2 border w-1/8'>Discord</th>
            <th className='p-2 border w-1/8'>Player</th>
            <th className='p-2 border w-1/8'>Discord</th>
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
