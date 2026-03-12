import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getGbanksGeneral } from '../services/adminApi'
import { getApiErrorMessage } from '../../../../utils/apiErrorHandler'
import { useAdaptivePolling } from '../hooks/useAdaptivePolling'
import { TransactionExtract } from './TransactionExtract'
import { GbankExtract } from './GbankExtract'

import type { VerifyTableData, VerifyTableProps } from '../types/admin'

export function VerifyTable({ onError }: VerifyTableProps) {
  const [sumsData, setSumsData] = useState<VerifyTableData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false) // Estado para controlar o diálogo do Player Extract
  const [isGbankDialogOpen, setIsGbankDialogOpen] = useState(false) // Estado para o diálogo do G-Bank Extract

  /**
   * Função para buscar os dados de soma do backend.
   */
  const fetchSumsData = async () => {
    try {
      const data = await getGbanksGeneral()
      setSumsData(data) // Atualiza os dados de soma
    } catch (err) {
      if (onError) {
        onError({
          message: getApiErrorMessage(err, 'Failed to fetch verify table data.'),
        })
      }
    }
  }

  /**
   * Hook de efeito para buscar os dados ao montar o componente.
   * Configura um intervalo para polling a cada 5 segundos.
   */
  useEffect(() => {
    fetchSumsData() // Busca inicial
  }, [])

  useAdaptivePolling({
    onPoll: fetchSumsData,
    activeDelayMs: 5000,
    inactiveDelayMs: 15000,
  })

  /**
   * Função utilitária para formatar números.
   * Arredonda o valor e o converte para o formato de string local.
   */
  const formatNumber = (value: number | undefined) =>
    (Math.round(value ?? 0) === 0 ? 0 : Math.round(value ?? 0)).toLocaleString('en-US')

  return (
    <div className='overflow-y-auto rounded-md text-white'>
      <div className='overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]'>
        <table className='w-full border-collapse'>
          <thead className='bg-white/[0.05] text-xs uppercase text-neutral-300'>
            <tr>
              <th className='border border-white/10 p-2 text-center'>G-Banks Sum</th>
              <th className='border border-white/10 p-2 text-center'>Balance Total Sum</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border border-white/10 p-2 text-center'>
                {formatNumber(sumsData?.general_balance_gbank)}
              </td>
              <td className='border border-white/10 p-2 text-center'>
                {formatNumber(sumsData?.general_balance)}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className='border border-white/10 bg-white/[0.06] p-2 text-center font-semibold'>
                Difference:{' '}
                {formatNumber(
                  (sumsData?.general_balance_gbank ?? 0) -
                    (sumsData?.general_balance ?? 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className='mt-4 flex justify-center gap-4'>
        <button
          type='button'
          className='rounded-md border border-purple-400/45 bg-purple-500/20 px-3 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-500/30'
          onClick={() => setIsDialogOpen(true)}
        >
          Player Extract
        </button>
        <button
          type='button'
          className='rounded-md border border-purple-400/45 bg-purple-500/20 px-3 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-500/30'
          onClick={() => setIsGbankDialogOpen(true)}
        >
          G-Bank Extract
        </button>
      </div>

      {isDialogOpen
        ? createPortal(
            <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
              <div className='h-[80vh] w-full max-w-5xl overflow-auto rounded-xl border border-white/10 bg-[#111115] p-4 text-white shadow-2xl'>
                <div className='mb-3 flex items-center justify-between'>
                  <h3 className='text-base font-semibold'>Player Extract</h3>
                  <button
                    type='button'
                    className='rounded px-2 py-1 text-sm hover:bg-white/10'
                    onClick={() => setIsDialogOpen(false)}
                  >
                    X
                  </button>
                </div>
                <TransactionExtract />
              </div>
            </div>,
            document.body
          )
        : null}

      {isGbankDialogOpen
        ? createPortal(
            <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
              <div className='h-[80vh] w-full max-w-5xl overflow-auto rounded-xl border border-white/10 bg-[#111115] p-4 text-white shadow-2xl'>
                <div className='mb-3 flex items-center justify-between'>
                  <h3 className='text-base font-semibold'>G-Bank Extract</h3>
                  <button
                    type='button'
                    className='rounded px-2 py-1 text-sm hover:bg-white/10'
                    onClick={() => setIsGbankDialogOpen(false)}
                  >
                    X
                  </button>
                </div>
                <GbankExtract />
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
