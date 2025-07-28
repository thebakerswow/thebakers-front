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
      let formattedData = ''

      try {
        const parsedData =
          typeof inviteData === 'string' ? JSON.parse(inviteData) : inviteData

        // Se o parsedData for diretamente um array
        if (Array.isArray(parsedData)) {
          formattedData = parsedData
            .map((name: any) => {
              if (typeof name === 'string') {
                return name.trim()
              }
              return String(name).trim()
            })
            .filter((name: string) => name.length > 0)
            .join('\n\n')
        } else if (parsedData.info && Array.isArray(parsedData.info)) {
          formattedData = parsedData.info
            .map((name: any) => {
              if (typeof name === 'string') {
                return name.trim()
              }
              return String(name).trim()
            })
            .filter((name: string) => name.length > 0)
            .join('\n\n')
        } else {
          formattedData =
            typeof inviteData === 'string'
              ? inviteData
              : JSON.stringify(inviteData)
        }
      } catch {
        // Se não conseguir fazer parse, tenta limpar a string diretamente
        formattedData =
          typeof inviteData === 'string'
            ? inviteData
                .replace(/[\[\]{}",]/g, '')
                .replace(/info:/g, '')
                .split(/\s+/)
                .filter((item: string) => item.length > 0)
                .join('\n\n')
            : JSON.stringify(inviteData)
      }

      navigator.clipboard.writeText(formattedData)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth='xs' fullWidth>
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
                  {(() => {
                    try {
                      const parsedData =
                        typeof inviteData === 'string'
                          ? JSON.parse(inviteData)
                          : inviteData

                      // Se o parsedData for diretamente um array
                      if (Array.isArray(parsedData)) {
                        return parsedData
                          .map((name: any) => {
                            if (typeof name === 'string') {
                              return name.trim()
                            }
                            return String(name).trim()
                          })
                          .filter((name: string) => name.length > 0)
                          .join('\n')
                      }

                      if (parsedData.info && Array.isArray(parsedData.info)) {
                        return parsedData.info
                          .map((name: any) => {
                            if (typeof name === 'string') {
                              return name.trim()
                            }
                            return String(name).trim()
                          })
                          .filter((name: string) => name.length > 0)
                          .join('\n')
                      }

                      return typeof inviteData === 'string'
                        ? inviteData
                        : JSON.stringify(inviteData, null, 2)
                    } catch {
                      // Se não conseguir fazer parse, tenta limpar a string diretamente
                      const cleanData =
                        typeof inviteData === 'string'
                          ? inviteData
                              .replace(/[\[\]{}",]/g, '')
                              .replace(/info:/g, '')
                              .split(/\s+/)
                              .filter((item: string) => item.length > 0)
                              .join('\n')
                          : JSON.stringify(inviteData, null, 2)
                      return cleanData
                    }
                  })()}
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
                  Copy
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
