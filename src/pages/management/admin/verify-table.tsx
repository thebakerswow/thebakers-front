import { useEffect, useState } from 'react'
import axios from 'axios'
import { getGbanksGeneral } from '../../../services/api/gbanks'
import { ErrorDetails } from '../../../components/error-display'
import { TransactionExtract } from '../../../components/transaction-extract'
import { GbankExtract } from '../../../components/gbank-extract'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material'

import { VerifyTableData } from '../../../types'

interface VerifyTableProps {
  onError?: (error: ErrorDetails) => void
}

export function VerifyTable({ onError }: VerifyTableProps) {
  const [sumsData, setSumsData] = useState<VerifyTableData | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true) // Controla se é a primeira requisição
  const [isDialogOpen, setIsDialogOpen] = useState(false) // Estado para controlar o diálogo do Player Extract
  const [isGbankDialogOpen, setIsGbankDialogOpen] = useState(false) // Estado para o diálogo do G-Bank Extract

  /**
   * Função para buscar os dados de soma do backend.
   * Exibe o estado de carregamento apenas na primeira requisição.
   */
  const fetchSumsData = async () => {
    try {
      const data = await getGbanksGeneral()
      setSumsData(data) // Atualiza os dados de soma
    } catch (err) {
      const errorDetails = axios.isAxiosError(err)
        ? {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          }
        : { message: 'Unexpected error', response: err }

      if (onError) {
        onError(errorDetails)
      }
    } finally {
      if (isFirstLoad) {
        setIsFirstLoad(false) // Marca que a primeira requisição foi concluída
      }
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
    <div className='overflow-y-auto rounded-md'>
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
                G-Banks Sum
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
          </TableBody>
        </Table>
      </TableContainer>
      {/* Botões abaixo da tabela */}
      <div className='mt-4 flex justify-center gap-4'>
        <Button
          variant='contained'
          sx={{
            backgroundColor: 'rgb(147, 51, 234)',
            '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
          }}
          onClick={() => setIsDialogOpen(true)} // Abre o diálogo do Player Extract
        >
          Player Extract
        </Button>
        <Button
          variant='contained'
          sx={{
            backgroundColor: 'rgb(147, 51, 234)',
            '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
          }}
          onClick={() => setIsGbankDialogOpen(true)} // Abre o diálogo do G-Bank Extract
        >
          G-Bank Extract
        </Button>
      </div>
      {/* Dialog para exibir os logs do Player Extract */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth='lg' // Set a larger max width
        fullWidth // Ensure the dialog takes the full width
      >
        <DialogTitle>Player Extract</DialogTitle>
        <DialogContent style={{ minHeight: '500px' }}>
          <TransactionExtract />
        </DialogContent>
      </Dialog>
      {/* Dialog para exibir os logs do G-Bank Extract */}
      <Dialog
        open={isGbankDialogOpen}
        onClose={() => setIsGbankDialogOpen(false)}
        maxWidth='lg' // Set a larger max width
        fullWidth // Ensure the dialog takes the full width
      >
        <DialogTitle>G-Bank Extract</DialogTitle>
        <DialogContent style={{ minHeight: '500px' }}>
          <GbankExtract />
        </DialogContent>
      </Dialog>
    </div>
  )
}
