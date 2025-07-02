import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface EditHistoryDialogProps {
  open: boolean
  onClose: () => void
}

// Definição de tipos discriminados para os edits

type RunEdit = {
  type: 'run'
  id: number
  field: string
  oldValue: string | number
  newValue: string | number
  editedBy: string
  date: string
}
type BuyerEdit = {
  type: 'buyer'
  id: number
  buyer: string
  field: string
  oldValue: string | number
  newValue: string | number
  editedBy: string
  date: string
}
type Edit = RunEdit | BuyerEdit

const mockRunEdits: RunEdit[] = [
  {
    type: 'run',
    id: 1,
    field: 'Max Buyers',
    oldValue: 10,
    newValue: 12,
    editedBy: 'Calmakarai',
    date: '2024-06-01 12:00',
  },
  {
    type: 'run',
    id: 2,
    field: 'Loot',
    oldValue: 'Saved',
    newValue: 'Unsaved',
    editedBy: 'Duckduck',
    date: '2024-06-02 15:30',
  },
]
const mockBuyerEdits: BuyerEdit[] = [
  {
    type: 'buyer',
    id: 1,
    buyer: 'Player1',
    field: 'Status',
    oldValue: 'waiting',
    newValue: 'group',
    editedBy: 'Calmakarai',
    date: '2024-06-01 13:00',
  },
  {
    type: 'buyer',
    id: 2,
    buyer: 'Player2',
    field: 'Paid Full',
    oldValue: 'false',
    newValue: 'true',
    editedBy: 'Calmakarai',
    date: '2024-06-02 16:00',
  },
]

const allEdits: Edit[] = [...mockRunEdits, ...mockBuyerEdits].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
)

export function EditHistoryDialog({ open, onClose }: EditHistoryDialogProps) {
  const [filter, setFilter] = useState('')

  const filteredEdits = useMemo(() => {
    if (!filter.trim()) return allEdits
    const lower = filter.toLowerCase()
    return allEdits.filter((edit) =>
      Object.values(edit).join(' ').toLowerCase().includes(lower)
    )
  }, [filter])

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        Edit History
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          label='Filter edits'
          variant='outlined'
          size='small'
          fullWidth
          sx={{ mt: 1, mb: 2 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Box mt={2}>
          <TableContainer component={Paper}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Old Value</TableCell>
                  <TableCell>New Value</TableCell>
                  <TableCell>Edited By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEdits.map((edit, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {edit.type === 'buyer' ? 'Buyer' : 'Run'}
                    </TableCell>
                    <TableCell>
                      {edit.type === 'buyer' ? edit.buyer : '-'}
                    </TableCell>
                    <TableCell>{edit.field}</TableCell>
                    <TableCell>{edit.oldValue}</TableCell>
                    <TableCell>{edit.newValue}</TableCell>
                    <TableCell>{edit.editedBy}</TableCell>
                    <TableCell>{edit.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
