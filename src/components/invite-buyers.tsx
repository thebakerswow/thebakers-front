import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Copy } from '@phosphor-icons/react'
import { getInviteBuyers } from '../services/api/buyers'
import { ErrorDetails } from './error-display'

interface InviteBuyersProps {
  onClose: () => void
  runId: string | undefined
  onError?: (error: ErrorDetails) => void
}

export function InviteBuyers({ onClose, runId, onError }: InviteBuyersProps) {
  const [inviteData, setInviteData] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInviteBuyersData() {
      if (!runId) return

      try {
        setLoading(true)
        const data = await getInviteBuyers(runId)
        setInviteData(data)
      } catch (error) {
        console.error('Error fetching invite buyers data:', error)
        if (onError) {
          const errorDetails = {
            message: 'Error fetching invite buyers data',
            response: error,
          }
          onError(errorDetails)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchInviteBuyersData()
  }, [runId, onError])

  function handleCopy() {
    if (inviteData) {
      navigator.clipboard.writeText(inviteData)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle className='relative text-center'>
        Invite Buyers
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box className='flex flex-col gap-4'>
          <Typography variant='h6' className='text-center'>
            Copy the message below and send it to invite buyers:
          </Typography>
          {loading ? (
            <Box className='flex justify-center'>
              <Typography>Loading...</Typography>
            </Box>
          ) : (
            <>
              <Box className='max-h-96 overflow-y-auto rounded border p-4'>
                <Typography
                  component='pre'
                  className='whitespace-pre-wrap text-sm'
                >
                  {inviteData}
                </Typography>
              </Box>
              <Box className='flex justify-center'>
                <Button
                  variant='contained'
                  startIcon={<Copy size={20} />}
                  onClick={handleCopy}
                  sx={{
                    backgroundColor: 'rgb(147, 51, 234)',
                    '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                  }}
                >
                  Copy to Clipboard
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
