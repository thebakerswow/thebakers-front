// Props for reusable components
export interface ErrorComponentProps {
  error: {
    message: string
    response?: any
    status?: number
  }
  onClose: () => void
}

export interface BuyersPreviewProps {
  runId: string
  onClose: () => void
}

export interface ColorSelectorProps {
  onSelectColor: (color: string) => void
}

export interface DeleteRunProps {
  run: {
    id: string
    raid: string
    date: string
  }
  onClose: () => void
  onDeleteSuccess: () => void
}

export interface EditHistoryDialogProps {
  open: boolean
  onClose: () => void
  idRun?: number
}

export interface EditBuyerProps {
  buyer: any
  onEdit: (buyer: any) => void
  onClose: () => void
}

export interface DeleteBuyerProps {
  buyer: any
  onDelete: () => void
  onClose: () => void
}

export interface BalanceTeamFilterProps {
  selectedTeam: string | null
  onChange: (team: string | null) => void
}

export interface InviteBuyersProps {
  runId: string
  onClose: () => void
}

export interface AddBuyerProps {
  runId: string
  onClose: () => void
  onBuyerAdded: () => void
}

export interface AttendanceProps {
  runId: string
  buyers: any[]
  onAttendanceChange: (buyerId: string, attended: boolean) => void
}

export interface AddRunProps {
  onClose: () => void
  onRunAddedReload: () => void
}

export interface EditRunProps {
  run: any
  onClose: () => void
  onRunEdit: () => void
}

export interface RunsDataProps {
  runs: any[]
  onRunClick: (run: any) => void
}

export interface RunInfoProps {
  run: any
  onClose: () => void
}

export interface BuyersGridProps {
  buyers: any[]
  onEdit: (buyer: any) => void
  onDelete: (buyer: any) => void
}

export interface DateFilterProps {
  selectedDate: string
  onDateChange: (date: string) => void
}
