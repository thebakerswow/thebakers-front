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
    setIsLoading(true)
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
    }, 30000) // Atualiza a cada 20 segundos

    return () => clearInterval(interval) // Limpa o intervalo ao desmontar o componente
  }, [])

  return (
    <div className='w-[20%] h-[90%] overflow-y-auto rounded-md'>
      {error ? (
        <div className='p-4 text-red-500'>{error.message}</div>
      ) : (
        <table className='border-collapse w-full'>
          <thead className='sticky top-0 bg-zinc-400 text-gray-700'>
            <tr className='text-md'>
              <th className='p-2 border w-[150px]'>GBANKS SOMA</th>
              <th className='p-2 border w-[150px]'>SOMA BALANCE TOTAL</th>
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {isLoading ? (
              <tr>
                <td colSpan={2} className='p-4 text-center'>
                  <span className='animate-spin border-4 border-t-transparent border-gray-600 rounded-full w-6 h-6 inline-block' />
                  <p>Carregando...</p>
                </td>
              </tr>
            ) : (
              <>
                <tr className='border border-gray-300'>
                  <td className='p-2 text-center'>
                    {Number(
                      sumsData?.general_balance_gbank ?? 0
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className='p-2 text-center'>
                    {Number(sumsData?.general_balance ?? 0).toLocaleString(
                      'en-US',
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </td>
                </tr>
                <tr className='border border-gray-300 bg-zinc-300'>
                  <td colSpan={2} className='p-2 text-center font-bold'>
                    Diferença:{' '}
                    {(
                      (sumsData?.general_balance_gbank ?? 0) +
                      (sumsData?.general_balance ?? 0)
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
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
