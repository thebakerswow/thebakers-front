import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash, PencilSimple } from '@phosphor-icons/react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Swal from 'sweetalert2'

import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { ApiErrorDetails, handleApiError } from '../../../../utils/apiErrorHandler'
import { AddReceipt } from './AddPayment'
import { EditReceipt } from './EditPayment'
import { SellsTabPageSkeleton } from './SellsTabPageSkeleton'
import {
  getReceiptsSales,
  getReceiptsPayers,
  deleteReceiptsSale,
  getReceiptsDates,
  type ReceiptsPayer,
  type ReceiptsSale,
  type ReceiptsDate,
} from '../services/dollarPaymentsApi'

interface ReceiptDisplay {
  id: number
  note: string
  payerName: string
  idPayer: number
  idReceiptsDate: number
  dollar: number
  createdAt: string
  receiptsDate: string
  status: string
}

interface ReceiptsSellsTabProps {
  onError?: (error: ApiErrorDetails | null) => void
}

export function ReceiptsSellsTab({ onError }: ReceiptsSellsTabProps) {
  const [receipts, setReceipts] = useState<ReceiptDisplay[]>([])
  const [receiptsDateFilter, setReceiptsDateFilter] = useState<string>('all')
  const [receiptStatusFilter, setReceiptStatusFilter] = useState<'pending' | 'completed'>('pending')
  const [isAddReceiptOpen, setIsAddReceiptOpen] = useState(false)
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(true)
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false)
  const [editingReceipt, setEditingReceipt] = useState<ReceiptDisplay | null>(null)
  const [receiptsDateOptions, setReceiptsDateOptions] = useState<ReceiptsDate[]>([])

  const formatDollar = (value: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

  const formatCreatedAt = (createdAt: string) => {
    if (!createdAt) return { date: '-', time: '-' }
    try {
      const date = parseISO(createdAt)
      return {
        date: format(date, 'MM/dd/yyyy', { locale: ptBR }),
        time: format(date, 'HH:mm'),
      }
    } catch {
      return { date: '-', time: '-' }
    }
  }

  const formatSummaryDate = (dateStr: string) => {
    const match = dateStr.match(/^\d{4}-(\d{1,2})-(\d{1,2})$/)
    if (!match) return dateStr
    return `${match[1]}/${match[2]}`
  }

  const fetchReceipts = async () => {
    try {
      setIsLoadingReceipts(true)
      const [salesData, payersData, receiptsDatesData] = await Promise.all([
        getReceiptsSales(),
        getReceiptsPayers(),
        getReceiptsDates({ is_date_valid: true }),
      ])

      const validSalesData = Array.isArray(salesData) ? salesData : []
      const validPayersData = Array.isArray(payersData) ? payersData : []
      const validReceiptsDatesData = Array.isArray(receiptsDatesData) ? receiptsDatesData : []

      const payersMap = new Map<number, string>()
      validPayersData.forEach((payer: ReceiptsPayer) => {
        payersMap.set(Number(payer.id), payer.name)
      })

      const datesMap = new Map<number, string>()
      validReceiptsDatesData.forEach((date: ReceiptsDate) => {
        datesMap.set(Number(date.id), date.name)
      })

      const mappedReceipts: ReceiptDisplay[] = validSalesData.map((sale: ReceiptsSale) => ({
        id: sale.id,
        note: sale.note,
        payerName: payersMap.get(sale.id_payer) || 'Unknown',
        idPayer: sale.id_payer,
        idReceiptsDate: sale.id_receipts_dolar_date,
        dollar: sale.dolar_amount ?? 0,
        createdAt: sale.created_at,
        receiptsDate: datesMap.get(sale.id_receipts_dolar_date) || sale.receipts_dolar_date || '',
        status: sale.status,
      }))

      setReceipts(mappedReceipts)
    } catch (error) {
      await handleApiError(error, 'Error fetching receipts')
      const errorDetails = { message: 'Error fetching receipts', response: error }
      if (onError) onError(errorDetails)
    } finally {
      setIsLoadingReceipts(false)
    }
  }

  const fetchDates = async () => {
    try {
      const receiptsDatesData = await getReceiptsDates({ is_date_valid: true })
      const validDates = Array.isArray(receiptsDatesData) ? receiptsDatesData : []
      const convertedDates = validDates.map((date) => {
        const match = date.name.match(/^\d{4}-(\d{1,2})-(\d{1,2})$/)
        if (!match) return date
        return { ...date, name: `${match[1]}/${match[2]}` }
      })
      convertedDates.sort((a, b) => a.name.localeCompare(b.name))
      setReceiptsDateOptions(convertedDates)
    } catch (error) {
      await handleApiError(error, 'Error fetching receipts dates')
      const errorDetails = { message: 'Error fetching receipts dates', response: error }
      if (onError) onError(errorDetails)
    }
  }

  useEffect(() => {
    fetchDates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchReceipts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptsDateFilter, receiptStatusFilter])

  useEffect(() => {
    if (!isLoadingReceipts && !hasCompletedInitialLoad) {
      setHasCompletedInitialLoad(true)
    }
  }, [isLoadingReceipts, hasCompletedInitialLoad])

  const filteredReceipts = useMemo(
    () =>
      receipts.filter(
        (receipt) =>
          (receiptsDateFilter === 'all' || receipt.receiptsDate === receiptsDateFilter) &&
          receipt.status === receiptStatusFilter
      ),
    [receiptStatusFilter, receipts, receiptsDateFilter]
  )

  const getReceiptsDateLabel = (receiptsDate: string) => (receiptsDate ? formatSummaryDate(receiptsDate).toUpperCase() : '-')

  const handleDeleteReceipt = async (receipt: ReceiptDisplay) => {
    const result = await Swal.fire({
      title: 'Delete Receipt?',
      text: 'Are you sure you want to delete this receipt? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })
    if (!result.isConfirmed) return

    try {
      await deleteReceiptsSale(receipt.id)
      await fetchReceipts()
      Swal.fire({ title: 'Deleted!', text: 'Receipt has been deleted successfully.', icon: 'success', timer: 1500, showConfirmButton: false })
    } catch (error) {
      await handleApiError(error, 'Failed to delete receipt.')
      const errorDetails = { message: 'Error deleting receipt', response: error }
      if (onError) onError(errorDetails)
    }
  }

  return (
    <>
      <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
        <div className='flex flex-wrap items-end gap-4'>
          <div className='min-w-[220px]'>
            <label className='mb-1 block text-xs text-white/70'>Receipts Date</label>
            <select
              value={receiptsDateFilter}
              onChange={(e) => setReceiptsDateFilter(e.target.value)}
              className='h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-purple-400/60'
            >
              <option value='all'>All Receipts Dates</option>
              {receiptsDateOptions.map((date) => (
                <option key={date.id} value={date.name}>
                  {date.name}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-2'>
            <p className='mr-1 text-sm text-neutral-400'>Status:</p>
            <button
              type='button'
              onClick={() => setReceiptStatusFilter('pending')}
              className='rounded-md border px-4 py-2 text-sm transition'
              style={{
                borderColor: receiptStatusFilter === 'pending' ? 'rgba(245,158,11,0.65)' : 'rgba(255,255,255,0.12)',
                color: receiptStatusFilter === 'pending' ? '#fcd34d' : '#d4d4d8',
                backgroundColor: receiptStatusFilter === 'pending' ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.03)',
              }}
            >
              Pending
            </button>
            <button
              type='button'
              onClick={() => setReceiptStatusFilter('completed')}
              className='rounded-md border px-4 py-2 text-sm transition'
              style={{
                borderColor: receiptStatusFilter === 'completed' ? 'rgba(16,185,129,0.65)' : 'rgba(255,255,255,0.12)',
                color: receiptStatusFilter === 'completed' ? '#6ee7b7' : '#d4d4d8',
                backgroundColor: receiptStatusFilter === 'completed' ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.03)',
              }}
            >
              Completed
            </button>
          </div>
        </div>

        <button
          type='button'
          onClick={() => setIsAddReceiptOpen(true)}
          className='inline-flex items-center gap-2 rounded-md border border-purple-400/50 bg-purple-500/20 px-4 py-2 text-sm text-purple-100 transition hover:bg-purple-500/30'
        >
          <Plus size={18} />
          Add Receipt
        </button>
      </div>

      {isLoadingReceipts ? (
        hasCompletedInitialLoad ? (
          <div className='flex justify-center py-16'>
            <LoadingSpinner size='lg' label='Loading receipts' />
          </div>
        ) : (
          <SellsTabPageSkeleton />
        )
      ) : filteredReceipts.length === 0 ? (
        <div className='rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-neutral-400'>
          No receipts found
        </div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
          <table className='w-full min-w-[980px] text-sm'>
            <thead>
              <tr className='border-b border-white/10 bg-white/[0.06] text-neutral-200'>
                <th className='px-4 py-4 text-left font-semibold'>Note</th>
                <th className='px-4 py-4 text-left font-semibold'>Payer</th>
                <th className='px-4 py-4 text-right font-semibold'>Dollar $</th>
                <th className='px-4 py-4 text-center font-semibold'>Date</th>
                <th className='px-4 py-4 text-center font-semibold'>Receipts Date</th>
                <th className='px-4 py-4 text-center font-semibold'>Status</th>
                <th className='px-4 py-4 text-center font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className='border-b border-white/5 transition hover:bg-white/[0.05]'>
                  <td className='px-4 py-3 text-white/90'>{receipt.note}</td>
                  <td className='px-4 py-3 font-medium text-white/90'>{receipt.payerName}</td>
                  <td className='px-4 py-3 text-right font-semibold text-emerald-300'>{formatDollar(receipt.dollar)}</td>
                  <td className='px-4 py-3 text-center text-neutral-400'>
                    <div className='flex flex-col items-center'>
                      <span className='text-white'>{formatCreatedAt(receipt.createdAt).date}</span>
                      <span className='font-mono text-xs text-neutral-400'>{formatCreatedAt(receipt.createdAt).time}</span>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-center text-white'>{getReceiptsDateLabel(receipt.receiptsDate)}</td>
                  <td className='px-4 py-3 text-center'>
                    <span
                      className='inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold'
                      style={{
                        color: receipt.status === 'completed' ? '#6ee7b7' : '#fcd34d',
                        borderColor: receipt.status === 'completed' ? 'rgba(16,185,129,0.45)' : 'rgba(245,158,11,0.45)',
                        backgroundColor: receipt.status === 'completed' ? 'rgba(16,185,129,0.16)' : 'rgba(245,158,11,0.16)',
                      }}
                    >
                      {receipt.status.toUpperCase()}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-center'>
                    {receipt.status !== 'completed' ? (
                      <div className='flex justify-center gap-2'>
                        <button
                          type='button'
                          onClick={() => setEditingReceipt(receipt)}
                          className='rounded-md bg-white/[0.03] p-1.5 text-purple-300 transition hover:bg-purple-500/15'
                          title='Edit'
                        >
                          <PencilSimple size={18} />
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDeleteReceipt(receipt)}
                          className='rounded-md bg-white/[0.03] p-1.5 text-red-400 transition hover:bg-red-500/15'
                          title='Delete'
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className='text-neutral-500'>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAddReceiptOpen && (
        <AddReceipt
          onClose={() => setIsAddReceiptOpen(false)}
          onReceiptAdded={() => {
            setIsAddReceiptOpen(false)
            fetchReceipts()
          }}
          onError={onError}
        />
      )}

      {editingReceipt && (
        <EditReceipt
          sale={{
            id: editingReceipt.id,
            note: editingReceipt.note,
            idPayer: editingReceipt.idPayer,
            idReceiptsDate: editingReceipt.idReceiptsDate,
            status: editingReceipt.status,
            payerName: editingReceipt.payerName,
            dollar: editingReceipt.dollar,
            receiptDate: editingReceipt.receiptsDate,
          }}
          onClose={() => setEditingReceipt(null)}
          onReceiptUpdated={() => {
            setEditingReceipt(null)
            fetchReceipts()
          }}
        />
      )}
    </>
  )
}

