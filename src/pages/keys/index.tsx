import { useState } from 'react'
import { KeysDataGrid } from './keys-data-grid'
import { format, addDays, subDays } from 'date-fns'
import { AddBuyer } from '../../components/add-buyer'
import { RunData, SumPot } from '../../types/runs-interface'
import undermineLogo from '../../assets/undermine-logo.png'
import {
  ArrowCircleLeft,
  ArrowCircleRight,
  Lock,
  UserPlus,
} from '@phosphor-icons/react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Button,
  Card,
  CardContent,
} from '@mui/material'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Mock inicial para buyers do dia
const mockBuyers = [
  {
    id: '1',
    nameAndRealm: 'BuyerOne-Azralon',
    buyerPot: 100000,
    buyerDolarPot: 0,
    buyerNote: 'VIP',
    nameOwnerBuyer: 'Owner1',
    nameCollector: 'Collector1',
    isPaid: false,
    status: 'waiting',
    playerClass: 'Mage',
    buyerActualPot: 100000,
    isEncrypted: false,
    fieldIsBlocked: false,
    idBuyerAdvertiser: '',
    idOwnerBuyer: '',
    paymentRealm: '',
    idRegister: '',
  },
]

// Mock collectors
const mockSumPot: SumPot[] = [
  { idDiscord: '1', username: 'goldcollector1', sumPot: 2080000, type: 'gold' },
  { idDiscord: '2', username: 'goldcollector2', sumPot: 160000, type: 'gold' },
  { idDiscord: '3', username: 'dollarcollector1', sumPot: 500, type: 'dolar' },
]

function getMockRun(date: Date, runIsLocked = false): RunData {
  return {
    id: date.toISOString(),
    runIsLocked,
    idTeam: 'keys',
    date: date.toISOString().slice(0, 10),
    time: '00:00',
    raid: 'Keys Service',
    runType: 'Daily',
    difficulty: '-',
    team: 'Keys',
    backups: 0,
    actualPot: 0,
    actualPotDolar: 0,
    slotAvailable: 0,
    maxBuyers: '0',
    raidLeaders: [],
    loot: '-',
    note: '',
    sumPot: mockSumPot,
    players: [],
    buyersCount: '0',
    quantityBoss: { String: '', Valid: false },
  }
}

export default function KeysPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [buyers] = useState(mockBuyers)
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)
  const [isLocked] = useState(false)

  // Função para simular reload dos buyers após adicionar
  const handleBuyerAddedReload = () => {
    setIsAddBuyerOpen(false)
  }

  const run = getMockRun(selectedDate, isLocked)

  return (
    <div className='m-8 flex w-full flex-col gap-4'>
      <div className='flex gap-2 rounded-md'>
        {/* Imagem grande à esquerda */}
        <img
          className='min-h-[220px] max-w-[400px] rounded-md'
          src={undermineLogo}
          alt='Keys Cover'
        />
        {/* Collectors */}
        {run.sumPot?.some(
          (item) => item.type === 'gold' && item.sumPot !== 0
        ) && (
          <div className='min-w-[200px] max-w-[400px] flex-1 rounded-md bg-gray-100 p-4 text-center text-black'>
            <h2 className='text-lg font-semibold'>Gold Collectors</h2>
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  {run.sumPot
                    ?.filter(
                      (item) => item.type === 'gold' && item.sumPot !== 0
                    )
                    .map((item) => (
                      <TableRow key={item.idDiscord} style={{ height: '20px' }}>
                        <TableCell style={{ padding: '10px' }}>
                          {item.username}
                        </TableCell>
                        <TableCell align='right' style={{ padding: '10px' }}>
                          {Math.round(Number(item.sumPot)).toLocaleString(
                            'en-US'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {run.sumPot?.some(
          (item) => item.type === 'dolar' && item.sumPot !== 0
        ) && (
          <div className='min-w-[200px] max-w-[400px] flex-1 rounded-md bg-gray-100 p-4 text-center text-black'>
            <h2 className='text-lg font-semibold'>Dolar Collectors</h2>
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  {run.sumPot
                    ?.filter(
                      (item) => item.type === 'dolar' && item.sumPot !== 0
                    )
                    .map((item) => (
                      <TableRow key={item.idDiscord} style={{ height: '20px' }}>
                        <TableCell style={{ padding: '10px' }}>
                          {item.username}
                        </TableCell>
                        <TableCell align='right' style={{ padding: '10px' }}>
                          {Number(item.sumPot).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {/* Centro/direita: navegação de datas e botões */}
        <Card
          className='grid flex-1 grid-cols-4 items-center text-left text-zinc-900'
          style={{ minWidth: '1000px', backgroundColor: '#f3f4f6' }}
        >
          <CardContent className='col-span-3 mb-6 ml-10 flex flex-col items-center'>
            {/* Navegação de datas */}
            <div className='mt-4 flex items-center gap-4'>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => {
                  if (date) setSelectedDate(date)
                }}
                dateFormat='dd/MM/yyyy'
                className='w-[140px] rounded border bg-white px-2 py-1 text-center text-lg font-bold shadow'
                popperPlacement='bottom-start'
                calendarClassName='z-50'
                inline
              />
              <button
                type='button'
                onClick={() => setSelectedDate((d) => subDays(d, 1))}
                className='flex h-14 w-14 items-center justify-center rounded-full text-blue-600 shadow-md transition-colors duration-150 hover:bg-blue-200'
              >
                <ArrowCircleLeft size={40} />
              </button>
              <span className='text-lg font-bold'>
                {format(selectedDate, 'EEEE, dd/MM/yyyy')}
              </span>
              <button
                type='button'
                onClick={() => setSelectedDate((d) => addDays(d, 1))}
                className='flex h-14 w-14 items-center justify-center rounded-full text-blue-600 shadow-md transition-colors duration-150 hover:bg-blue-200'
              >
                <ArrowCircleRight size={40} />
              </button>
            </div>
          </CardContent>
          <CardContent className='m-4 flex flex-col items-center justify-center gap-2'>
            <Button
              variant='contained'
              startIcon={<UserPlus size={18} />}
              fullWidth
              onClick={() => setIsAddBuyerOpen(true)}
              disabled={isLocked}
              sx={{
                backgroundColor: isLocked
                  ? 'rgb(209, 213, 219)'
                  : 'rgb(239, 68, 68)',
                '&:hover': {
                  backgroundColor: isLocked
                    ? 'rgb(209, 213, 219)'
                    : 'rgb(248, 113, 113)',
                },
              }}
            >
              Add Buyer
            </Button>
            <Button
              variant='contained'
              startIcon={<Lock size={18} />}
              fullWidth
              sx={{
                backgroundColor: 'rgb(239, 68, 68)',
                '&:hover': {
                  backgroundColor: 'rgb(248, 113, 113)',
                },
              }}
            >
              Lock Day
            </Button>
          </CardContent>
        </Card>
      </div>
      <KeysDataGrid data={buyers} />
      {/* Modal de adicionar buyer */}
      {isAddBuyerOpen && (
        <AddBuyer
          run={run}
          onClose={() => setIsAddBuyerOpen(false)}
          onBuyerAddedReload={handleBuyerAddedReload}
        />
      )}
    </div>
  )
}
