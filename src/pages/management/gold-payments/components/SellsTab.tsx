import { useMemo, useState, useEffect, type CSSProperties } from 'react'
import { Plus, Trash, PencilSimple, CaretDown } from '@phosphor-icons/react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ErrorDetails } from '../../../../components/error-display'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { handleApiError } from '../../../../utils/apiErrorHandler'
import { AddPayment } from './AddPayment'
import { EditSale } from './EditSale'
import { SellsTabPageSkeleton } from './SellsTabPageSkeleton'
import { getSales, getPayers, deleteSale, getPaymentDates, getPaymentSummaryByStatus } from '../services/goldPaymentApi'
import type { Payer, Sale, PaymentDate, PaymentSummaryResponse } from '../types/goldPayments'
import { getMonthDaySortValue, toMonthDay } from '../utils/paymentDate'
import Swal from 'sweetalert2'

interface PaymentDisplay {
  id: number
  note: string
  buyer: string
  buyerName: string
  idPayer: number
  idPaymentDate: number
  valueGold: number
  dollar: number
  mValue: number
  createdAt: string
  paymentDate: string
  status: string
}

interface SellsTabProps {
  onError?: (error: ErrorDetails | null) => void
}

export function SellsTab({ onError }: SellsTabProps) {
  const [payments, setPayments] = useState<PaymentDisplay[]>([])
  const [paymentDateFilter, setPaymentDateFilter] = useState<string | null>(null)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'pending' | 'completed'>('pending')
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [editingSale, setEditingSale] = useState<PaymentDisplay | null>(null)
  const [paymentDateOptions, setPaymentDateOptions] = useState<PaymentDate[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryResponse | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false)
  const [isPaymentDateAutocompleteOpen, setIsPaymentDateAutocompleteOpen] = useState(false)
  const [paymentDateSearch, setPaymentDateSearch] = useState('')

  // Função para formatar valor para exibição
  const formatValueForDisplay = (value: number): string => {
    const formatted = Math.abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return value < 0 ? `-${formatted}` : formatted
  }

  // Função para formatar valor em dólar
  const formatDollar = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  // Função para formatar data do created_at
  const formatCreatedAt = (createdAt: string) => {
    if (!createdAt) return { date: '-', time: '-' }
    
    try {
      const date = parseISO(createdAt)
      return {
        date: format(date, "MM/dd/yyyy", { locale: ptBR }),
        time: format(date, "HH:mm")
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return { date: '-', time: '-' }
    }
  }

  // Função para converter data de YYYY-MM-DD para MM/DD
  const formatSummaryDate = (dateStr: string) => {
    return toMonthDay(dateStr)
  }

  const fetchPayments = async () => {
    try {
      setIsLoadingPayments(true)
      
      // Busca sales, payers e payment dates em paralelo
      const [salesData, payersData, paymentDatesData] = await Promise.all([
        getSales(),
        getPayers(),
        getPaymentDates()
      ])
      
      // Validação: garante que os dados são arrays
      const validSalesData = Array.isArray(salesData) ? salesData : []
      const validPayersData = Array.isArray(payersData) ? payersData : []
      const validPaymentDatesData = Array.isArray(paymentDatesData) ? paymentDatesData : []
      
      // Cria um mapa de id_payer -> name para busca rápida
      const payersMap = new Map<number, string>()
      validPayersData.forEach((payer: Payer) => {
        payersMap.set(Number(payer.id), payer.name)
      })
      
      // Cria um mapa de id_payment_date -> name para busca rápida
      const paymentDatesMap = new Map<number, string>()
      validPaymentDatesData.forEach((paymentDate: PaymentDate) => {
        paymentDatesMap.set(Number(paymentDate.id), paymentDate.name)
      })
      
      // Mapeia os dados da API para o formato de exibição
      const mappedPayments: PaymentDisplay[] = validSalesData.map((sale: Sale) => {
        const rawPaymentDate = paymentDatesMap.get(sale.id_payment_date) || sale.payment_date
        const formattedPaymentDate = toMonthDay(rawPaymentDate)
        
        return {
          id: sale.id,
          note: sale.note,
          buyer: String(sale.id_payer), // Mantém o ID para futuras operações
          buyerName: payersMap.get(sale.id_payer) || 'Unknown',
          idPayer: sale.id_payer,
          idPaymentDate: sale.id_payment_date,
          valueGold: sale.gold_value,
          dollar: sale.dolar_value,
          mValue: sale.m_value,
          createdAt: sale.created_at,
          paymentDate: formattedPaymentDate,
          status: sale.status,
        }
      })
      
      setPayments(mappedPayments)
    } catch (error) {
      console.error('Error fetching payments:', error)
      await handleApiError(error, 'Error fetching payments')
      const errorDetails = {
        message: 'Error fetching payments',
        response: error,
      }
      if (onError) {
        onError(errorDetails)
      }
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const handlePaymentDateFilter = (paymentDate: string | null) => {
    setPaymentDateFilter(paymentDate)
  }

  const handlePaymentStatusFilter = (status: 'pending' | 'completed') => {
    setPaymentStatusFilter(status)
  }


  const handleDeleteSale = async (payment: PaymentDisplay) => {
    const result = await Swal.fire({
      title: 'Delete Sale?',
      text: `Are you sure you want to delete this sale? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        await deleteSale(payment.id)
        
        // Re-fetch da lista de sales e summary
        await fetchPayments()
        await fetchSummary()
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Sale has been deleted successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error('Error deleting sale:', error)
        await handleApiError(error, 'Failed to delete sale.')
      }
    }
  }

  // Carregar lista de payment dates ao montar o componente
  useEffect(() => {
    const fetchPaymentDatesData = async () => {
      try {
        const paymentDatesData = await getPaymentDates()
        const validPaymentDatesData = Array.isArray(paymentDatesData) ? paymentDatesData : []
        
        const convertedDates = validPaymentDatesData.map(date => ({
          ...date,
          name: toMonthDay(date.name),
        }))
        
        // Ordenar datas por data parseada (cronologicamente)
        const sortedDates = [...convertedDates].sort((dateA, dateB) => {
          // PRIORIDADE 1: Tenta parsear como data MM/DD
          const dateValueA = getMonthDaySortValue(dateA.name)
          const dateValueB = getMonthDaySortValue(dateB.name)
          
          if (dateValueA && dateValueB) {
            return dateValueA - dateValueB
          }
          
          // PRIORIDADE 2: Se não conseguir parsear, tenta ordenar por ID
          const idA = Number(dateA.id)
          const idB = Number(dateB.id)
          
          if (!isNaN(idA) && !isNaN(idB)) {
            return idA - idB
          }
          
          // PRIORIDADE 3: Fallback para ordenação alfabética
          return dateA.name.localeCompare(dateB.name)
        })
        
        setPaymentDateOptions(sortedDates)
      } catch (error) {
        console.error('Error fetching payment dates:', error)
        await handleApiError(error, 'Error fetching payment dates')
        const errorDetails = {
          message: 'Error fetching payment dates',
          response: error,
        }
        if (onError) {
          onError(errorDetails)
        }
      }
    }

    fetchPaymentDatesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Função para buscar summary da API
  const fetchSummary = async () => {
    try {
      setIsLoadingSummary(true)
      const summaryData = await getPaymentSummaryByStatus()
      setPaymentSummary(summaryData)
    } catch (error) {
      console.error('Error fetching payment summary:', error)
      await handleApiError(error, 'Error fetching payment summary')
    } finally {
      setIsLoadingSummary(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [paymentDateFilter, paymentStatusFilter])

  // Buscar summary da API
  useEffect(() => {
    fetchSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentDateFilter, paymentStatusFilter])

  const getPaymentDateLabel = (paymentDate: string) => {
    if (!paymentDate) return '-'
    // Format payment dates nicely
    if (paymentDate.startsWith('payment')) {
      const datePart = paymentDate.replace('payment', 'Payment').trim()
      return datePart.toUpperCase()
    }
    return formatSummaryDate(paymentDate).toUpperCase()
  }

  const getStatusLabel = (status: string) => {
    if (!status) return '-'
    return status.toUpperCase()
  }

  const getStatusBadgeStyle = (status: string): CSSProperties => {
    const normalized = status?.toLowerCase()

    if (normalized === 'completed') {
      return {
        color: '#6ee7b7',
        borderColor: 'rgba(16,185,129,0.45)',
        backgroundColor: 'rgba(16,185,129,0.16)',
      }
    }

    if (normalized === 'pending') {
      return {
        color: '#fcd34d',
        borderColor: 'rgba(245,158,11,0.45)',
        backgroundColor: 'rgba(245,158,11,0.16)',
      }
    }

    return {
      color: '#e5e7eb',
      borderColor: 'rgba(255,255,255,0.15)',
      backgroundColor: 'rgba(255,255,255,0.04)',
    }
  }

  const filteredPayments = useMemo(() => {
    const normalizedFilterDate = paymentDateFilter?.trim() || null
    const normalizedStatus = paymentStatusFilter.toLowerCase()

    return payments.filter((payment) => {
      const matchesDate = !normalizedFilterDate || payment.paymentDate?.trim() === normalizedFilterDate
      const matchesStatus = payment.status?.toLowerCase() === normalizedStatus
      return matchesDate && matchesStatus
    })
  }, [paymentDateFilter, paymentStatusFilter, payments])

  const paymentDateNames = useMemo(
    () => (paymentDateOptions?.map((date) => date.name) || []).filter(Boolean),
    [paymentDateOptions]
  )

  const filteredPaymentDateOptions = useMemo(() => {
    const search = paymentDateSearch.trim().toLowerCase()
    if (!search) return paymentDateNames
    return paymentDateNames.filter((option) => option.toLowerCase().includes(search))
  }, [paymentDateNames, paymentDateSearch])

  const isAnyLoading = isLoadingPayments || isLoadingSummary

  useEffect(() => {
    if (!isAnyLoading && !hasCompletedInitialLoad) {
      setHasCompletedInitialLoad(true)
    }
  }, [isAnyLoading, hasCompletedInitialLoad])

  if (isAnyLoading) {
    if (!hasCompletedInitialLoad) {
      return <SellsTabPageSkeleton />
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64, paddingBottom: 64 }}>
        <LoadingSpinner size='lg' label='Loading sales data' />
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Payment Date Filter */}
          <div className='relative min-w-[220px]'>
            <label className='mb-1 block text-xs text-white/70'>Payment Date</label>
            <input
              type='text'
              value={paymentDateSearch}
              onChange={(e) => {
                const nextValue = e.target.value
                setPaymentDateSearch(nextValue)
                const hasSearch = Boolean(nextValue.trim())
                setIsPaymentDateAutocompleteOpen(hasSearch)
                if (!hasSearch) handlePaymentDateFilter(null)
              }}
              onFocus={() => setIsPaymentDateAutocompleteOpen(false)}
              onBlur={() => setTimeout(() => setIsPaymentDateAutocompleteOpen(false), 120)}
              placeholder='All dates'
              className='h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 pr-9 text-sm text-white outline-none transition focus:border-purple-400/60'
            />
            <CaretDown
              size={16}
              className='pointer-events-none absolute right-3 top-[33px] text-white/60'
            />
            {isPaymentDateAutocompleteOpen && paymentDateSearch.trim() && (
              <div className='absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-white/10 bg-[#1a1a1a] py-1 shadow-lg'>
                {filteredPaymentDateOptions.length > 0 ? (
                  filteredPaymentDateOptions.map((option) => (
                    <button
                      key={option}
                      type='button'
                      onMouseDown={() => {
                        setPaymentDateSearch(option)
                        handlePaymentDateFilter(option)
                        setIsPaymentDateAutocompleteOpen(false)
                      }}
                      className='block w-full px-3 py-2 text-left text-sm text-neutral-200 transition hover:bg-white/10'
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <div className='px-3 py-2 text-sm text-neutral-500'>No options</div>
                )}
              </div>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginRight: 8, margin: 0 }}>
              Status:
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type='button'
                onClick={() => handlePaymentStatusFilter('pending')}
                className='rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white transition hover:border-purple-400/50 hover:bg-purple-500/15 disabled:opacity-50'
                style={{
                  borderColor:
                    paymentStatusFilter === 'pending' ? 'rgba(245,158,11,0.65)' : 'rgba(255,255,255,0.12)',
                  color: paymentStatusFilter === 'pending' ? '#fcd34d' : '#d4d4d8',
                  backgroundColor:
                    paymentStatusFilter === 'pending' ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.03)',
                  minWidth: '110px',
                  padding: '8px 20px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              >
                <span className='inline-flex items-center gap-2'>Pending</span>
              </button>
              <button
                type='button'
                onClick={() => handlePaymentStatusFilter('completed')}
                className='rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white transition hover:border-purple-400/50 hover:bg-purple-500/15 disabled:opacity-50'
                style={{
                  borderColor:
                    paymentStatusFilter === 'completed' ? 'rgba(16,185,129,0.65)' : 'rgba(255,255,255,0.12)',
                  color: paymentStatusFilter === 'completed' ? '#6ee7b7' : '#d4d4d8',
                  backgroundColor:
                    paymentStatusFilter === 'completed' ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.03)',
                  minWidth: '120px',
                  padding: '8px 20px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              >
                <span className='inline-flex items-center gap-2'>Completed</span>
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <button
            type='button'
            onClick={() => setIsAddPaymentOpen(true)}
            className='rounded-md border border-purple-400/50 bg-purple-500/20 px-3 py-2 text-sm text-purple-100 transition hover:bg-purple-500/25 disabled:opacity-50'
            style={{
              height: 40,
              padding: '8px 20px',
              boxShadow: 'none',
            }}
          >
            <span className='inline-flex items-center gap-2'>
              <Plus size={20} />
              Add Sale
            </span>
          </button>
        </div>
      </div>

      {/* Layout com duas colunas: Tabela Principal e Resumo */}
      <div className='grid grid-cols-1 gap-3 lg:grid-cols-12' style={{ gap: '24px' }}>
        {/* Coluna da Tabela Principal */}
        <div className='col-span-1 lg:col-span-8'>
          {filteredPayments.length === 0 ? (
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                padding: 32,
                textAlign: 'center',
                borderRadius: '12px',
                boxShadow: 'none',
              }}
            >
              <p style={{ color: '#9ca3af' }}>
                No payments found
              </p>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto rounded-xl border border-white/10 bg-white/[0.05]'>
                <table className='w-full min-w-[1000px] text-sm'>
                  <thead>
                    <tr className='border-b border-white/10 bg-white/[0.06] text-neutral-200'>
                      <th className='px-4 py-4 text-center font-semibold'>Note</th>
                      <th className='px-4 py-4 text-center font-semibold'>Buyer</th>
                      <th className='px-4 py-4 text-right font-semibold'>Value Gold</th>
                      <th className='px-4 py-4 text-right font-semibold'>Dollar $</th>
                      <th className='px-4 py-4 text-right font-semibold'>M Value in $</th>
                      <th className='px-4 py-4 text-center font-semibold'>Date</th>
                      <th className='px-4 py-4 text-center font-semibold'>Payment Date</th>
                      <th className='px-4 py-4 text-center font-semibold'>Status</th>
                      <th className='px-4 py-4 text-center font-semibold'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr
                        className='border-b border-white/5 transition hover:bg-white/[0.05]'
                        key={payment.id}
                      >
                        <td className='px-4 py-3 text-center text-sm text-white/90'>
                          {payment.note}
                        </td>
                        <td className='px-4 py-3 text-center text-sm font-medium text-white/90'>
                          {payment.buyerName}
                        </td>
                        <td className='px-4 py-3 text-right text-sm font-semibold text-blue-300'>
                          {formatValueForDisplay(payment.valueGold)}g
                        </td>
                        <td className='px-4 py-3 text-right text-sm font-semibold text-emerald-300'>
                          {formatDollar(payment.dollar)}
                        </td>
                        <td className='px-4 py-3 text-right text-sm font-semibold text-violet-300'>
                          {formatDollar(payment.mValue)}
                        </td>
                        <td className='px-4 py-3 text-center text-sm text-neutral-400'>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ fontSize: '0.85rem', color: 'white' }}>
                              {formatCreatedAt(payment.createdAt).date}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                              {formatCreatedAt(payment.createdAt).time}
                            </p>
                          </div>
                        </td>
                        <td className='px-4 py-3 text-center text-sm text-neutral-400'>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ fontSize: '0.85rem', color: 'white' }}>
                              {getPaymentDateLabel(payment.paymentDate)}
                            </p>
                          </div>
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <span
                            className='inline-flex rounded-full border px-2 py-0.5 text-xs'
                            style={{ fontWeight: 'bold', fontSize: '0.75rem', ...getStatusBadgeStyle(payment.status) }}
                          >
                            {getStatusLabel(payment.status)}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-center'>
                          {payment.status !== 'completed' ? (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <span title='Edit'>
                                <button
                                  type='button'
                                  onClick={() => setEditingSale(payment)}
                                  className='rounded-md bg-white/[0.03] p-1.5 text-white transition hover:bg-purple-500/15'
                                  style={{
                                    color: 'rgb(147, 51, 234)',
                                    borderRadius: '8px',
                                  }}
                                >
                                  <PencilSimple size={18} />
                                </button>
                              </span>
                              <span title='Delete'>
                                <button
                                  type='button'
                                  onClick={() => handleDeleteSale(payment)}
                                  className='rounded-md bg-white/[0.03] p-1.5 text-white transition hover:bg-purple-500/15'
                                  style={{
                                    color: '#ef4444',
                                    borderRadius: '8px',
                                  }}
                                >
                                  <Trash size={18} />
                                </button>
                              </span>
                            </div>
                          ) : (
                            <p style={{ color: '#9ca3af' }}>
                              -
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </>
          )}
        </div>

        {/* Coluna da Tabela de Resumo */}
        <div className='col-span-1 lg:col-span-4'>
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '12px',
              boxShadow: 'none',
              padding: 24,
              position: 'sticky',
              top: 20,
            }}
          >
            <p
              style={{
                color: 'white',
                fontWeight: 'bold',
                marginBottom: 24,
                textAlign: 'center',
                borderBottom: '1px solid rgba(168,85,247,0.45)',
                paddingBottom: 8,
              }}
            >
              Pending Sales Summary
            </p>

            {/* Loading State */}
            <>
              {/* Summary por data */}
              {paymentSummary && paymentSummary.info.summary && Array.isArray(paymentSummary.info.summary) && paymentSummary.info.summary.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
                {[...paymentSummary.info.summary]
                  .sort((a, b) => {
                    // Ordena da data mais antiga para a mais atual
                    return new Date(a.date).getTime() - new Date(b.date).getTime()
                  })
                  .map((dateData) => {
                  // Usa valores que vêm da API e arredonda
                  const goldTotalGeral = Math.round(dateData.gold_total_geral || 0)
                  const goldInStock = Math.round(dateData.gold_in_stock || 0)
                  const goldMissing = Math.round(dateData.total_sold_date || 0)
                  const hasEnoughGoldForDate = goldMissing >= 0
                  
                  return (
                    <div
                      key={dateData.date}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: '10px',
                        padding: 16,
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span className='inline-flex rounded-full border border-white/15 px-2 py-0.5 text-xs' style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                          {formatSummaryDate(dateData.date).toUpperCase()}
                        </span>
                        <p
                          style={{
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        >
                          {dateData.total_payments} {dateData.total_payments === 1 ? 'payment' : 'payments'}
                        </p>
                      </div>

                      {/* Informações do Status Pending */}
                      {dateData.status_breakdown && dateData.status_breakdown.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {dateData.status_breakdown
                            .filter((statusData) => statusData.status.toLowerCase() === 'pending')
                            .map((statusData) => (
                              <div key={statusData.status} style={{
                                backgroundColor: 'rgba(255,255,255,0.03)', 
                                padding: 12, 
                                borderRadius: 1,
                                border: '1px solid rgba(255,255,255,0.10)'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <span
                                    className='inline-flex rounded-full border px-2 py-0.5 text-xs'
                                    style={{ fontWeight: 'bold', fontSize: '0.7rem', ...getStatusBadgeStyle(statusData.status) }}
                                  >
                                    {statusData.status.toUpperCase()}
                                  </span>
                                  <p style={{ color: 'white', fontWeight: 600 }}>
                                    {statusData.payments_count} {statusData.payments_count === 1 ? 'payment' : 'payments'}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                                      Gold:
                                    </p>
                                    <p style={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                                      {formatValueForDisplay(statusData.gold_amount)}g
                                    </p>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                                      Dollar:
                                    </p>
                                    <p style={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                                      {formatDollar(statusData.m_total_value)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Gold Control - Para cada data */}
                      <div
                        style={{ 
                          marginTop: 16, 
                          paddingTop: 16, 
                          borderTop: '1px solid rgba(255,255,255,0.10)',
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1 
                        }}
                      >
                        {/* Gold Total */}
                        <span title='Total gold available in the players balance system for this payment date'>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                            <p style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                              Gold Balance Total:
                            </p>
                            <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.75rem' }}>
                              {formatValueForDisplay(goldTotalGeral)}g
                            </p>
                          </div>
                        </span>

                        {/* Estoque de Gold */}
                        <span title='Quantity of gold in stock available for this payment date (Gbank - Sold)'>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                            <p style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                              Gold in Stock:
                            </p>
                            <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.75rem' }}>
                              {formatValueForDisplay(goldInStock)}g
                            </p>
                          </div>
                        </span>

                        {/* Gold Missing Date */}
                        <span
                          title={hasEnoughGoldForDate 
                            ? "Surplus: quantity of gold that remains after meeting all pending payments for this date" 
                            : "Missing: quantity of gold that is still needed to complete all pending payments for this date"}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                            <p style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600 }}>
                              {hasEnoughGoldForDate ? 'Surplus:' : 'Missing:'}
                            </p>
                            <p
                              style={{ 
                                color: hasEnoughGoldForDate ? '#10b981' : '#ef4444', 
                                fontWeight: 700,
                                fontSize: '0.75rem'
                              }}
                            >
                              {formatValueForDisplay(goldMissing)}g
                            </p>
                          </div>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Total Geral */}
            {paymentSummary && paymentSummary.info.totals ? (
              <div
                  style={{
                    backgroundColor: 'rgba(147,51,234,0.16)',
                    border: '1px solid rgba(168,85,247,0.45)',
                    borderRadius: '10px',
                    padding: 20,
                    marginTop: 16,
                  }}
                >
                  <p
                    style={{
                      color: '#e9d5ff',
                      fontWeight: 'bold',
                      marginBottom: 16,
                      textAlign: 'center',
                    }}
                  >
                   TOTAL
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: '#9ca3af' }}>
                        Payments:
                      </p>
                      <p
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {paymentSummary.info.totals.total_payments}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: '#9ca3af' }}>
                        Total Gold:
                      </p>
                      <p
                        style={{
                          color: 'white',
                          fontWeight: 700,
                        }}
                      >
                        {formatValueForDisplay(paymentSummary.info.totals.total_gold)}g
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: '#9ca3af' }}>
                        Total Dollar:
                      </p>
                      <p
                        style={{
                          color: 'white',
                          fontWeight: 700,
                        }}
                      >
                        {formatDollar(paymentSummary.info.totals.m_total_value)}
                      </p>
                    </div>
                  </div>

                  {/* Total Agrupado por Status */}
                  {paymentSummary.info.totals.by_status && paymentSummary.info.totals.by_status.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(168,85,247,0.45)' }}>
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: 16, fontWeight: 600 }}>
                        By Status:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[...paymentSummary.info.totals.by_status]
                          .sort((a, b) => {
                            // Pending sempre em cima
                            if (a.status === 'pending') return -1
                            if (b.status === 'pending') return 1
                            return 0
                          })
                          .map((statusData) => (
                          <div key={statusData.status} style={{
                            backgroundColor: 'rgba(255,255,255,0.03)', 
                            padding: 16, 
                            borderRadius: 1,
                            border: '1px solid rgba(255,255,255,0.10)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <span
                                className='inline-flex rounded-full border px-2 py-0.5 text-xs'
                                style={{ fontWeight: 'bold', fontSize: '0.75rem', ...getStatusBadgeStyle(statusData.status) }}
                              >
                                {statusData.status.toUpperCase()}
                              </span>
                              <p style={{ color: 'white', fontWeight: 700 }}>
                                {statusData.payments_count} {statusData.payments_count === 1 ? 'payment' : 'payments'}
                              </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                                  Gold:
                                </p>
                                <p style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {formatValueForDisplay(statusData.gold_amount)}g
                                </p>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                                  Dollar:
                                </p>
                                <p style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {formatDollar(statusData.m_total_value)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', paddingTop: 32, paddingBottom: 32 }}>
                No summary data available
              </p>
            )}
            </>
          </div>
        </div>
      </div>

      {/* Add Payment Dialog */}
      {isAddPaymentOpen && (
        <AddPayment
          onClose={() => setIsAddPaymentOpen(false)}
          onPaymentAdded={() => {
            setIsAddPaymentOpen(false)
            fetchPayments()
            fetchSummary()
          }}
          onError={onError}
        />
      )}

      {/* Edit Sale Dialog */}
      {editingSale && (
        <EditSale
          sale={{
            id: editingSale.id,
            note: editingSale.note,
            idPayer: editingSale.idPayer,
            idPaymentDate: editingSale.idPaymentDate,
            status: editingSale.status,
            buyerName: editingSale.buyerName,
            valueGold: editingSale.valueGold,
            dollar: editingSale.dollar,
            mValue: editingSale.mValue,
            paymentDate: editingSale.paymentDate,
          }}
          onClose={() => setEditingSale(null)}
          onSaleUpdated={() => {
            setEditingSale(null)
            fetchPayments()
            fetchSummary()
          }}
        />
      )}
    </>
  )
}

