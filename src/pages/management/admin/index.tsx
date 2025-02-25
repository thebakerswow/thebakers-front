import { DotsThreeVertical } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

export function AdminPage() {
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  function toggleActionsDropdown(index: number) {
    setOpenRowIndex((prev) => (prev === index ? null : index))
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenRowIndex(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='bg-zinc-700 text-gray-100 absolute inset-0 flex gap-10 items-center justify-center rounded-xl shadow-2xl m-8 overflow-y-auto scrollbar-thin'>
      {/* Primeira Tabela */}
      <div className='w-[45%] h-[90%] overflow-y-auto border border-gray-300 rounded-md'>
        <table className='border-collapse w-full'>
          <thead className='table-header-group sticky top-0 bg-zinc-400 text-gray-700'>
            <tr className='text-md'>
              <th className='p-2 border w-[150px]'>
                <select className='bg-zinc-100 w-full'>
                  <option value=''>Select Team</option>
                </select>
              </th>
              <th className='p-2 border w-[150px]'>
                <select className='bg-zinc-100 w-full'>
                  <option value=''>Select Day</option>
                  <option value='monday'>Monday</option>
                  <option value='tuesday'>Tuesday</option>
                </select>
              </th>
              <th className='p-2 border w-[150px]'>
                <select className='bg-zinc-100 w-full'>
                  <option value=''>Select Day</option>
                  <option value='monday'>Monday</option>
                  <option value='tuesday'>Tuesday</option>
                </select>
              </th>
              <th className='p-2 border w-[150px]'>BALANCE TOTAL</th>
              <th className='p-2 border'>CALCULADORA</th>
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {Array.from({ length: 30 }).map((_, index) => (
              <tr key={index} className='border border-gray-300'>
                <td className='p-2 text-center'>Player {index + 1}</td>
                <td className='p-2 text-center'>Gold Coletado {index + 1}</td>
                <td className='p-2 text-center'>Gold Ganho(cut) {index + 1}</td>
                <td className='p-2 text-center'></td>
                <td className='p-2 text-center'>
                  <input
                    className='p-1 px-2 bg-zinc-100 rounded-md'
                    type='text'
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Segunda Tabela */}
      <div className='w-[25%] h-[90%] overflow-y-auto border border-gray-300 rounded-md flex flex-col'>
        <div className='flex gap-4 p-2 bg-zinc-400 top-0'>
          <input className='rounded-md text-black px-1' type='text' />
          <button className='bg-red-400 px-4 py-1 rounded-md hover:bg-red-500 transition-colors'>
            Add G-Bank
          </button>
        </div>
        <table className='border-collapse w-full'>
          <thead className='sticky top-0 bg-zinc-400 text-gray-700'>
            <tr className='text-md'>
              <th className='p-2 border' />
              <th className='p-2 border w-[150px]'>GBANKS</th>
              <th className='p-2 border w-[150px]'>SALDO</th>
              <th className='p-2 border w-[150px]'>CALCULADORA</th>
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {Array.from({ length: 20 }).map((_, index) => (
              <tr key={index} className='border border-gray-300'>
                <td className='p-2 relative'>
                  <button onClick={() => toggleActionsDropdown(index)}>
                    <DotsThreeVertical size={20} />
                  </button>
                  {openRowIndex === index && (
                    <div
                      ref={menuRef}
                      className='absolute left-8 top-0 flex flex-col gap-2 p-2 px-4 bg-white border rounded shadow-md z-50'
                    >
                      <button className='text-left hover:bg-gray-100'>
                        Edit
                      </button>
                      <button className='text-left hover:bg-gray-100'>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
                <td className='p-2 text-center'>G-Bank {index + 1}</td>
                <td className='p-2 text-center'></td>
                <td className='p-2 text-center'>
                  <input className='p-2 bg-zinc-100 rounded-md' type='text' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Terceira Tabela */}
      <div className='w-[20%] h-[90%] overflow-y-auto rounded-md'>
        <table className='border-collapse w-full'>
          <thead className='sticky top-0 bg-zinc-400 text-gray-700'>
            <tr className='text-md'>
              <th className='p-2 border w-[150px]'>GBANKS SOMA</th>
              <th className='p-2 border w-[150px]'>SOMA BALANCE TOTAL</th>
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {Array.from({ length: 1 }).map((_, index) => (
              <tr key={index} className='border border-gray-300'>
                <td className='p-2 text-center'>10</td>
                <td className='p-2 text-center'>10</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
