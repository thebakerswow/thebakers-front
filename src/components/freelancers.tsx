import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/axiosConfig'
import { CircleNotch } from '@phosphor-icons/react'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from './error-display'
import { LoadingSpinner } from './loading-spinner' // Import reusable spinner
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Button, // Import Button from Material-UI
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { Modal, Modal as MuiModal, Box } from '@mui/material'

interface User {
  id_discord: string
  username: string
  percentage: number
}

interface FreelancersProps {
  runId: string | undefined
}

export function Freelancers({ runId }: FreelancersProps) {
  const [freelancers, setFreelancers] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false) // For adding freelancers
  const [isLoadingFreelancers, setIsLoadingFreelancers] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [freelancerToDelete, setFreelancerToDelete] = useState<string | null>(
    null
  )
  const [deletingFreelancerId, setDeletingFreelancerId] = useState<
    string | null
  >(null) // Track the specific freelancer being deleted

  const fetchData = useCallback(async (url: string, setter: Function) => {
    try {
      const response = await api.get(url)
      setter(response.data.info || [])
    } catch (error) {
      handleError(error)
    }
  }, [])

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      setError({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
    } else {
      setError({ message: 'Unexpected error', response: error })
    }
  }

  useEffect(() => {
    if (runId) {
      fetchData(`/freelancers/${runId}`, setFreelancers).finally(() =>
        setIsLoadingFreelancers(false)
      )
      fetchData(`/freelancer/users/${runId}`, setUsers)
    }
  }, [runId, fetchData])

  useEffect(() => {
    setFilteredUsers(
      search.trim()
        ? users.filter((user) =>
            user.username.toLowerCase().includes(search.toLowerCase())
          )
        : []
    )
  }, [search, users])

  const handleAddFreelancer = async () => {
    if (!selectedUser || !runId) return
    setIsSubmitting(true)
    try {
      await api.post('/freelancer', {
        id_discord: selectedUser.id_discord,
        id_run: runId,
      })
      await fetchData(`/freelancers/${runId}`, setFreelancers)
      setSearch('')
      setSelectedUser(null)
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDeleteDialog = (id_discord: string) => {
    setFreelancerToDelete(id_discord)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setFreelancerToDelete(null)
  }

  const handleConfirmDeleteFreelancer = async () => {
    if (!runId || !freelancerToDelete) return
    setDeletingFreelancerId(freelancerToDelete) // Set the ID of the freelancer being deleted
    setError(null) // Reset error state before attempting deletion
    try {
      await api.delete(
        `/freelancer/id_discord/${freelancerToDelete}/run/${runId}`
      )
      await fetchData(`/freelancers/${runId}`, setFreelancers)
    } catch (err) {
      const errorDetails = axios.isAxiosError(err)
        ? {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          }
        : { message: 'Unexpected error', response: err }
      setError(errorDetails)
    } finally {
      setDeletingFreelancerId(null) // Reset the deleting state
      handleCloseDeleteDialog()
    }
  }

  const handleAttendanceClick = async (
    id_discord: string,
    percentage: number
  ) => {
    if (!runId) return

    try {
      await api.put('/freelancer', { id_discord, id_run: runId, percentage })
      setFreelancers((prev) =>
        prev.map((freelancer) =>
          freelancer.id_discord === id_discord
            ? { ...freelancer, percentage }
            : freelancer
        )
      )
    } catch (error) {
      handleError(error)
    }
  }

  const getColorForPercentage = useCallback(
    (percentage: number) =>
      percentage === 0 ? '#ef4444' : percentage === 100 ? '#16a34a' : '#fde047',
    []
  )

  const renderSelect = (idDiscord: string, percentage: number) => (
    <Select
      value={percentage}
      onChange={(e) => handleAttendanceClick(idDiscord, Number(e.target.value))}
      style={{
        backgroundColor: getColorForPercentage(percentage),
        color: 'white',
        height: '30px',
        fontSize: '14px',
      }}
    >
      {[...Array(11)].map((_, i) => {
        const value = i * 10
        return (
          <MenuItem key={value} value={value}>
            {value}%
          </MenuItem>
        )
      })}
    </Select>
  )

  if (error) {
    return (
      <MuiModal open={!!error} onClose={() => setError(null)}>
        <Box className='absolute left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-gray-400 p-4 shadow-lg'>
          <ErrorComponent error={error} onClose={() => setError(null)} />
        </Box>
      </MuiModal>
    )
  }

  const textFieldStyles = {
    inputLabel: { style: { color: 'gray' } },
    input: { style: { color: '#000', backgroundColor: '#FFF' } }, // Background set to white
    sx: {
      '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#ECEBEE' },
        '&:hover fieldset': { borderColor: '#ECEBEE' },
        '&.Mui-focused fieldset': { borderColor: '#ECEBEE' },
        '& input': { backgroundColor: '#FFF' }, // Background set to white
      },
    },
  }

  return (
    <div className='w-[40%]'>
      <div className='flex flex-col items-center'>
        <div className='relative mb-2 flex w-full items-center gap-2'>
          <Autocomplete
            options={filteredUsers}
            getOptionLabel={(option) => option.username}
            value={selectedUser}
            onChange={(_, newValue) => {
              setSelectedUser(newValue)
              setSearch(newValue ? newValue.username : '')
            }}
            inputValue={search}
            onInputChange={(_, newInputValue) => setSearch(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Freelancer'
                variant='outlined'
                size='small'
                InputLabelProps={textFieldStyles.inputLabel}
                InputProps={{
                  ...params.InputProps,
                  ...textFieldStyles.input,
                }}
                sx={{
                  ...textFieldStyles.sx,
                  width: '300px', // Increased width
                }}
              />
            )}
          />
          <Button
            variant='contained'
            color='error'
            onClick={handleAddFreelancer}
            startIcon={
              isSubmitting ? <CircleNotch className='animate-spin' /> : null
            }
            sx={{
              textTransform: 'none',
              padding: '6px 16px',
              fontSize: '14px',
              height: '40px',
              minWidth: '100px', // Ensure button width remains consistent
              backgroundColor: 'rgb(239, 68, 68)',
              '&:hover': { backgroundColor: 'rgb(248, 113, 113)' },
            }}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </Button>
        </div>
        <TableContainer
          component={Paper}
          style={{
            backgroundColor: 'white',
            overflow: 'hidden', // Alterado para garantir o borderRadius
            borderRadius: '6px',
          }} // Ensure no scrollbars are added
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  align='center'
                  style={{ backgroundColor: '#ECEBEE' }}
                >
                  Freelancer
                </TableCell>
                <TableCell
                  align='center'
                  style={{ backgroundColor: '#ECEBEE' }}
                >
                  Attendance
                </TableCell>
                <TableCell
                  align='center'
                  style={{ backgroundColor: '#ECEBEE' }}
                >
                  Delete
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingFreelancers ? (
                <TableRow>
                  <TableCell align='center' sx={{ padding: '8px' }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : freelancers.length === 0 ? (
                <TableRow sx={{ height: '50px' }}>
                  <TableCell
                    align='center'
                    colSpan={3}
                    sx={{ padding: '4px', textAlign: 'center' }}
                  >
                    No Freelancer
                  </TableCell>
                </TableRow>
              ) : (
                freelancers.map((user) => (
                  <TableRow key={user.id_discord} sx={{ height: '40px' }}>
                    <TableCell align='center' sx={{ padding: '4px' }}>
                      {user.username}
                    </TableCell>
                    <TableCell align='center' sx={{ padding: '4px' }}>
                      {renderSelect(user.id_discord, user.percentage)}
                    </TableCell>
                    <TableCell align='center' sx={{ padding: '4px' }}>
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(user.id_discord)}
                        disabled={deletingFreelancerId === user.id_discord} // Disable only for the row being deleted
                      >
                        {deletingFreelancerId === user.id_discord ? ( // Show loading only for the row being deleted
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby='delete-modal-title'
        aria-describedby='delete-modal-description'
        className='flex items-center justify-center'
      >
        <div
          className='w-96 rounded-lg bg-white p-4 shadow-lg'
          style={{
            width: '400px',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'white',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {error ? (
            <ErrorComponent error={error} onClose={() => setError(null)} />
          ) : (
            <>
              <h2
                id='delete-modal-title'
                className='mb-4 text-lg font-semibold'
              >
                Confirm Deletion
              </h2>
              <p id='delete-modal-description' className='mb-4 text-sm'>
                Are you sure you want to delete{' '}
                <span className='font-bold'>
                  {
                    freelancers.find((f) => f.id_discord === freelancerToDelete)
                      ?.username
                  }
                </span>
                ?
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='contained'
                  color='inherit'
                  onClick={handleCloseDeleteDialog}
                  disabled={deletingFreelancerId !== null} // Disable cancel button during deletion
                  sx={{ textTransform: 'none', fontSize: '14px' }}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  color='error'
                  disabled={deletingFreelancerId !== null} // Disable delete button during deletion
                  onClick={handleConfirmDeleteFreelancer}
                  sx={{ textTransform: 'none', fontSize: '14px' }}
                >
                  {deletingFreelancerId !== null ? (
                    <div className='flex gap-4'>
                      <LoadingSpinner /> Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
