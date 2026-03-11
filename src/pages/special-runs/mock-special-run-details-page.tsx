import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AddBuyer } from '../../components/add-buyer'
import { useAuth } from '../../context/auth-context'
import { RunData } from '../../types/runs-interface'
import { SpecialRunDetails } from './components/special-run-details'
import { SpecialRunBuyersGrid } from './components/special-run-buyers-grid'
import { MockBuyer, MockBuyerStatus, MockRunInfo } from './special-run-mock-types'

interface MockSpecialRunDetailsPageProps {
  runType: string
  logoSrc?: string
}

const statusOrder: Record<MockBuyerStatus, number> = {
  done: 1,
  group: 2,
  waiting: 3,
  noshow: 4,
}

const statusOptions = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'noshow', label: 'No Show' },
  { value: 'group', label: 'Group' },
  { value: 'done', label: 'Done' },
]

function getStatusStyle(status: MockBuyerStatus): string {
  switch (status) {
    case 'waiting':
      return 'bg-amber-500/35'
    case 'group':
      return 'bg-sky-500/35'
    case 'done':
      return 'bg-emerald-500/35'
    case 'noshow':
      return 'bg-rose-500/35'
    default:
      return 'bg-white/5'
  }
}

function buildMockBuyers(runType: string): MockBuyer[] {
  return [
    {
      id: `${runType.toLowerCase()}-01`,
      status: 'group',
      nameAndRealm: `Alpha${runType}-Azralon`,
      note: 'Ready for invite',
      advertiser: 'Mika',
      collector: 'Luna',
      paidFull: true,
      dolarPot: 0,
      goldPot: 1250000,
      runPot: 1250000,
      playerClass: 'Mage',
      claimed: true,
      claimedById: 'Luna',
      claimedByName: 'Luna',
    },
    {
      id: `${runType.toLowerCase()}-02`,
      status: 'waiting',
      nameAndRealm: `Beta${runType}-Stormrage`,
      note: 'Needs summon',
      advertiser: 'Noah',
      collector: 'Rex',
      paidFull: false,
      dolarPot: 28.5,
      goldPot: 0,
      runPot: 28.5,
      playerClass: 'Warrior',
      claimed: false,
      claimedById: null,
      claimedByName: null,
    },
    {
      id: `${runType.toLowerCase()}-03`,
      status: 'waiting',
      nameAndRealm: `Gamma${runType}-Illidan`,
      note: 'Waiting in queue',
      advertiser: 'Sia',
      collector: 'Luna',
      paidFull: false,
      dolarPot: 0,
      goldPot: 950000,
      runPot: 950000,
      playerClass: 'Priest',
      claimed: true,
      claimedById: 'Sia',
      claimedByName: 'Sia',
    },
    {
      id: `${runType.toLowerCase()}-04`,
      status: 'done',
      nameAndRealm: `Delta${runType}-Ragnaros`,
      note: 'Completed',
      advertiser: 'Mika',
      collector: 'Rex',
      paidFull: true,
      dolarPot: 0,
      goldPot: 1400000,
      runPot: 1400000,
      playerClass: 'Druid',
      claimed: true,
      claimedById: 'Rex',
      claimedByName: 'Rex',
    },
    {
      id: `${runType.toLowerCase()}-05`,
      status: 'noshow',
      nameAndRealm: `Echo${runType}-Area52`,
      note: 'No response',
      advertiser: 'Noah',
      collector: 'Luna',
      paidFull: false,
      dolarPot: 0,
      goldPot: 0,
      runPot: 0,
      playerClass: 'Rogue',
      claimed: false,
      claimedById: null,
      claimedByName: null,
    },
  ]
}

function buildMockRunInfo(runType: string): MockRunInfo {
  return {
    raid: `${runType} Boost`,
    difficulty: 'Mythic',
    time: '20:30:00',
    loot: 'Personal',
    maxBuyers: 5,
    slotAvailable: 1,
    backups: 2,
    raidLeaders: ['Mock Leader 1', 'Mock Leader 2'],
    actualPot: 3600000,
    actualPotDolar: 42.5,
    sumPot: [
      { idDiscord: 'g1', username: 'Luna', sumPot: 2400000, type: 'gold' },
      { idDiscord: 'g2', username: 'Rex', sumPot: 1200000, type: 'gold' },
      { idDiscord: 'd1', username: 'Mika', sumPot: 42.5, type: 'dolar' },
    ],
  }
}

export function MockSpecialRunDetailsPage({ runType }: MockSpecialRunDetailsPageProps) {
  const { id } = useParams<{ id: string }>()
  const { username, idDiscord } = useAuth()
  const responsibleUser = username || idDiscord || 'You'
  const responsibleUserId = idDiscord || username || null
  const runInfo = useMemo(() => buildMockRunInfo(runType), [runType])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [buyers, setBuyers] = useState<MockBuyer[]>(() => buildMockBuyers(runType))
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)

  const mockRunData = useMemo<RunData>(
    () => ({
      id: id || `mock-${runType.toLowerCase()}`,
      name: { String: `${runType} Boost`, Valid: true },
      runIsLocked: false,
      idTeam: runType.toLowerCase(),
      date: new Date().toISOString().split('T')[0],
      time: runInfo.time,
      raid: runInfo.raid,
      runType,
      difficulty: runInfo.difficulty,
      team: runType,
      backups: runInfo.backups,
      actualPot: runInfo.actualPot,
      actualPotDolar: runInfo.actualPotDolar,
      slotAvailable: runInfo.slotAvailable,
      maxBuyers: String(runInfo.maxBuyers),
      raidLeaders: runInfo.raidLeaders.map((leader, index) => ({
        idCommunication: `mock-comm-${index + 1}`,
        idDiscord: `mock-discord-${index + 1}`,
        username: leader,
      })),
      loot: runInfo.loot,
      note: '',
      sumPot: runInfo.sumPot,
      players: [],
      buyersCount: `${runInfo.maxBuyers - runInfo.slotAvailable}/${runInfo.maxBuyers}`,
      quantityBoss: { String: '', Valid: false },
    }),
    [id, runInfo, runType]
  )

  useEffect(() => {
    setBuyers(buildMockBuyers(runType))
  }, [runType])

  const sortedBuyers = useMemo(
    () => [...buyers].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]),
    [buyers]
  )

  const canToggleClaim = (buyer: MockBuyer) =>
    !buyer.claimed || (responsibleUserId !== null && buyer.claimedById === responsibleUserId)

  const handleStatusChange = (buyerId: string, newStatus: string) => {
    if (!responsibleUserId) return

    setBuyers((prev) =>
      prev.map((buyer) => {
        if (buyer.id !== buyerId) return buyer

        const nextStatus = newStatus as MockBuyerStatus

        if (nextStatus === 'group' || nextStatus === 'done') {
          return {
            ...buyer,
            status: nextStatus,
            claimed: true,
            paidFull: true,
            collector: buyer.collector === '-' ? responsibleUser : buyer.collector,
            claimedById: buyer.claimedById || responsibleUserId,
            claimedByName: buyer.claimedByName || responsibleUser,
          }
        }

        if (nextStatus === 'noshow') {
          return {
            ...buyer,
            status: nextStatus,
            claimed: false,
            paidFull: false,
            collector: '-',
            claimedById: null,
            claimedByName: null,
          }
        }

        return { ...buyer, status: nextStatus }
      })
    )
  }

  const handleClaim = (buyerId: string) => {
    if (!responsibleUserId) return

    setBuyers((prev) =>
      prev.map((buyer) =>
        buyer.id === buyerId
          ? buyer.claimed
            ? buyer.claimedById === responsibleUserId
              ? {
                  ...buyer,
                  claimed: false,
                  paidFull: false,
                  collector: '-',
                  claimedById: null,
                  claimedByName: null,
                }
              : buyer
            : {
                ...buyer,
                claimed: true,
                paidFull: true,
                collector: responsibleUser,
                claimedById: responsibleUserId,
                claimedByName: responsibleUser,
              }
          : buyer
      )
    )
  }

  const selectedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(selectedDate),
    [selectedDate]
  )

  return (
    <div className='flex w-full flex-col overflow-auto rounded-xl text-gray-100 shadow-2xl'>
      <div className='mx-2 p-4 pb-20'>
        <SpecialRunDetails
          selectedDateLabel={selectedDateLabel}
          onPreviousDate={() =>
            setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1))
          }
          onNextDate={() =>
            setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1))
          }
          onOpenAddBuyer={() => setIsAddBuyerOpen(true)}
        />
        <SpecialRunBuyersGrid
          buyers={sortedBuyers}
          statusOptions={statusOptions}
          getStatusStyle={getStatusStyle}
          onStatusChange={handleStatusChange}
          onClaim={handleClaim}
          canToggleClaim={canToggleClaim}
        />
      </div>

      {isAddBuyerOpen && (
        <AddBuyer
          run={mockRunData}
          onClose={() => setIsAddBuyerOpen(false)}
          onBuyerAddedReload={() => undefined}
        />
      )}
    </div>
  )
}
