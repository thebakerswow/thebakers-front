import { useEffect, useState } from 'react'
import axios from 'axios'
import { api } from '../../../../services/axiosConfig'
import { ErrorDetails } from '../../../../components/error-display'

interface VerifyTableData {
  general_balance_gbank: number
  general_balance: number
}

export function VerifyTable() {
  const [sumsData, setSumsData] = useState<VerifyTableData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const fetchSumsData = async () => {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/gbanks/general`
      )
      // Supondo que a resposta seja um objeto do tipo VerifyTableData
      setSumsData(response.data.info)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
        setError(errorDetails)
      } else {
        setError({
          message: 'Erro inesperado',
          response: error,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSumsData() // Primeira chamada imediata

    const interval = setInterval(() => {
      fetchSumsData()
    }, 5000) // Atualiza a cada 5 segundos

    return () => clearInterval(interval) // Limpa o intervalo ao desmontar o componente
  }, [])

  return (
    <div className='h-[90%] w-[20%] overflow-y-auto rounded-md'>
      {error ? (
        <div className='p-4 text-red-500'>{error.message}</div>
      ) : (
        <table className='w-full border-collapse'>
          <thead className='sticky top-0 bg-zinc-400 text-gray-700'>
            <tr className='text-md'>
              <th className='w-[150px] border p-2'>GBANKS SOMA</th>
              <th className='w-[150px] border p-2'>SOMA BALANCE TOTAL</th>
            </tr>
          </thead>
          <tbody className='table-row-group bg-zinc-200 text-sm font-medium text-zinc-900'>
            {isLoading ? (
              <tr>
                <td colSpan={2} className='p-4 text-center'>
                  <span className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent' />
                  <p>Carregando...</p>
                </td>
              </tr>
            ) : (
              <>
                <tr className='border border-gray-300'>
                  <td className='p-2 text-center'>
                    {Math.round(
                      Number(sumsData?.general_balance_gbank ?? 0)
                    ).toLocaleString('en-US')}
                  </td>
                  <td className='p-2 text-center'>
                    {Math.round(
                      Number(sumsData?.general_balance ?? 0)
                    ).toLocaleString('en-US')}
                  </td>
                </tr>
                <tr className='border border-gray-300 bg-zinc-300'>
                  <td colSpan={2} className='p-2 text-center font-bold'>
                    Diferença:{' '}
                    {Math.round(
                      (sumsData?.general_balance_gbank ?? 0) -
                        (sumsData?.general_balance ?? 0)
                    ).toLocaleString('en-US')}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
