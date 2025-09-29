import { useState, useMemo, useEffect } from 'react'
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
import { getRunHistory } from '../services/api/runs'
import { RunHistory } from '../types/runs-interface'
import dayjs from 'dayjs'

import { EditHistoryDialogProps } from '../types'

export function EditHistoryDialog({
  open,
  onClose,
  idRun,
}: EditHistoryDialogProps) {
  const [filter, setFilter] = useState('')
  const [history, setHistory] = useState<RunHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !idRun) return
    setLoading(true)
    getRunHistory(idRun.toString())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [open, idRun])

  const filteredHistory = useMemo(() => {
    if (!filter.trim()) return history
    const lower = filter.toLowerCase()
    return history.filter((edit) => {
      const idBuyerStr =
        edit.id_buyer && edit.id_buyer.Valid
          ? edit.id_buyer.Int64.toString()
          : ''
      const searchString = [
        idBuyerStr,
        edit.field,
        edit.old_value,
        edit.new_value,
        edit.name_edited_by,
        edit.created_at,
      ]
        .join(' ')
        .toLowerCase()
      return searchString.includes(lower)
    })
  }, [filter, history])

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth='lg' 
      fullWidth
      slotProps={{
        paper: {
          sx: {
            maxHeight: '90vh', // Limita a altura máxima a 90% da altura da viewport
            height: 'auto',
            marginTop: '64px', // Margem do header (altura padrão do AppBar)
            marginBottom: '16px',
          }
        }
      }}
    >
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
      <DialogContent sx={{ p: 2 }}>
        {!idRun ? (
          <Box color='error.main' mb={2}>
            No run id provided
          </Box>
        ) : null}
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
          <TableContainer 
            component={Paper}
            sx={{
              maxHeight: '60vh', // Limita a altura da tabela a 60% da viewport
              overflow: 'auto', // Adiciona scroll interno
            }}
          >
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Id Buyer</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Old Value</TableCell>
                  <TableCell>New Value</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align='center'>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align='center'>
                      No history found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((edit, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {edit.id_buyer && edit.id_buyer.Valid
                          ? edit.id_buyer.Int64.toString()
                          : '-'}
                      </TableCell>
                      <TableCell>{edit.field}</TableCell>
                      <TableCell>{edit.old_value}</TableCell>
                      <TableCell>{edit.new_value}</TableCell>
                      <TableCell>{edit.name_edited_by}</TableCell>
                      <TableCell>
                        {dayjs(edit.created_at).format('HH:mm - MM/DD/YYYY')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
