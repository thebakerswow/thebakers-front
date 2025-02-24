export function AdminPage() {
  return (
    <div className='bg-zinc-700 text-gray-100 p-4 flex items-center justify-center font-semibold rounded-xl shadow-2xl mt-20 gap-10'>
      <table className=' border-collapse '>
        <thead className='table-header-group '>
          <h1>VALOR COLETADO</h1>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            {/* Cabeçalhos com selects */}
            <th className='p-2 border w-[150px]'>
              <select className='bg-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition w-full'>
                <option value=''>Select Team</option>
                <option value='slot1'>Team 1</option>
                <option value='slot2'>Team 2</option>
                <option value='slot3'>Team 3</option>
              </select>
            </th>
            <th className='p-2 border w-[150px]'>
              <select className='bg-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition w-full'>
                <option value=''>Select Day</option>
                <option value='monday'>Monday</option>
                <option value='tuesday'>Tuesday</option>
                <option value='wednesday'>Wednesday</option>
                <option value='thursday'>Thursday</option>
                <option value='friday'>Friday</option>
                <option value='saturday'>Saturday</option>
                <option value='sunday'>Sunday</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {/* Dados fixos apenas para visualização */}
          {Array.from({ length: 15 }).map((_, index) => (
            <tr key={index} className='border border-gray-300'>
              <td className='p-2 text-center'>Player {index + 1} </td>
              <td className='p-2 text-center'>Gold ganho {index + 1}</td>
              <td className='p-2 text-center'>Valor coletado {index + 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className=' border-collapse '>
        <thead className='table-header-group '>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            {/* Cabeçalhos com selects */}
            <th className='p-2 border w-[150px]'>BALANCE TOTAL</th>
            <th className='p-2 border w-[150px]'>CALCULADORA</th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {/* Dados fixos apenas para visualização */}
          {Array.from({ length: 15 }).map((_, index) => (
            <tr key={index} className='border border-gray-300'>
              <td className='p-2 text-center'> </td>
              <td className='p-2 text-center'>
                <input type='text' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className=' border-collapse '>
        <thead className='table-header-group '>
          <tr className='text-md bg-zinc-400 text-gray-700'>
            {/* Cabeçalhos com selects */}
            <th className='p-2 border w-[150px]'>GBANKS</th>
            <th className='p-2 border w-[150px]'>SALDO</th>
            <th className='p-2 border w-[150px]'>CALCULADORA</th>
          </tr>
        </thead>
        <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
          {/* Dados fixos apenas para visualização */}
          {Array.from({ length: 15 }).map((_, index) => (
            <tr key={index} className='border border-gray-300'>
              <td className='p-2 text-center'> </td>
              <td className='p-2 text-center'> </td>
              <td className='p-2 text-center'>
                <input type='text' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
