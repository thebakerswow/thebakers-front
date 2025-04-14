import { useEffect, useState } from 'react'
import axios from 'axios'
import { api } from '../../../../services/axiosConfig'
import { ErrorDetails } from '../../../../components/error-display'
import { TransactionExtract } from '../../../../components/transaction-extract'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material'

interface VerifyTableData {
  general_balance_gbank: number
  general_balance: number
}

export function VerifyTable() {
  const [sumsData, setSumsData] = useState<VerifyTableData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true) // Controla se é a primeira requisição
  const [isDialogOpen, setIsDialogOpen] = useState(false) // Estado para controlar o diálogo

  /**
   * Função para buscar os dados de soma do backend.
   * Exibe o estado de carregamento apenas na primeira requisição.
   */
  const fetchSumsData = async () => {
    if (isFirstLoad) setIsLoading(true) // Exibe loading apenas na primeira requisição
    try {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/gbanks/general`
      )
      setSumsData(data.info) // Atualiza os dados de soma
      setError(null) // Limpa erros anteriores
    } catch (err) {
      // Define o erro com base no tipo de erro (Axios ou genérico)
      setError(
        axios.isAxiosError(err)
          ? {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
            }
          : { message: 'Erro inesperado', response: err }
      )
    } finally {
      setIsLoading(false) // Finaliza o estado de carregamento
      setIsFirstLoad(false) // Marca que a primeira requisição foi concluída
    }
  }

  /**
   * Hook de efeito para buscar os dados ao montar o componente.
   * Configura um intervalo para polling a cada 5 segundos.
   */
  useEffect(() => {
    fetchSumsData() // Busca inicial
    const interval = setInterval(fetchSumsData, 5000) // Polling a cada 5 segundos
    return () => clearInterval(interval) // Limpa o intervalo ao desmontar o componente
  }, [])

  /**
   * Função utilitária para formatar números.
   * Arredonda o valor e o converte para o formato de string local.
   */
  const formatNumber = (value: number | undefined) =>
    Math.round(value ?? 0).toLocaleString('en-US')

  return (
    <div className='h-[90%] w-[20%] overflow-y-auto rounded-md'>
      {error ? (
        // Exibe mensagem de erro, se houver
        <Typography color='error' variant='body1' className='p-4'>
          {error.message}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: '#ECEBEE',
                  }}
                  align='center'
                >
                  GBanks Sum
                </TableCell>
                <TableCell
                  style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: '#ECEBEE',
                  }}
                  align='center'
                >
                  Balance Total Sum
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Exibe indicador de carregamento na primeira requisição
                <TableRow>
                  <TableCell colSpan={2} align='center'>
                    <CircularProgress />
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* Exibe os dados de soma */}
                  <TableRow>
                    <TableCell align='center'>
                      {formatNumber(sumsData?.general_balance_gbank)}
                    </TableCell>
                    <TableCell align='center'>
                      {formatNumber(sumsData?.general_balance)}
                    </TableCell>
                  </TableRow>
                  {/* Exibe a diferença calculada */}
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      align='center'
                      style={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        backgroundColor: '#ECEBEE',
                      }}
                    >
                      Difference:{' '}
                      {formatNumber(
                        (sumsData?.general_balance_gbank ?? 0) -
                          (sumsData?.general_balance ?? 0)
                      )}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Botão abaixo da tabela */}
      <div className='mt-4 flex justify-center'>
        <Button
          variant='contained'
          sx={{
            backgroundColor: 'rgb(239, 68, 68)',
            '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
          }}
          onClick={() => setIsDialogOpen(true)} // Abre o diálogo
        >
          Open Extract
        </Button>
      </div>
      {/* Dialog para exibir os logs */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth='lg' // Set a larger max width
        fullWidth // Ensure the dialog takes the full width
      >
        <DialogTitle>Extract</DialogTitle>
        <DialogContent style={{ minHeight: '500px' }}>
          <TransactionExtract />
        </DialogContent>
      </Dialog>
    </div>
  )
}
