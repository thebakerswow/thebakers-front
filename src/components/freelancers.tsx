import { useState, useEffect } from 'react'
import { api } from '../services/axiosConfig'
import { CircleNotch, Trash } from '@phosphor-icons/react'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from './error-display'
import { Modal } from './modal'

interface User {
  id_discord: string
  username: string
  percentage: number
}

interface FreelancersProps {
  runId: string | undefined
}

export function Freelancers({ runId }: FreelancersProps) {
  const [freelancers, setFreelancers] = useState<User[]>([]) // Dados da tabela
  const [users, setUsers] = useState<User[]>([]) // Dados do autocomplete
  const [search, setSearch] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)
  const [isLoadingFreelancers, setIsLoadingFreelancers] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)

  // Buscar freelancers para popular a TABELA
  useEffect(() => {
    if (!runId) return
    const fetchFreelancers = async () => {
      try {
        const response = await api.get(`/freelancers/${runId}`)
        setFreelancers(response.data.info || []) // Garante que sempre seja um array
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError({
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          })
        } else {
          setError({ message: 'Erro inesperado', response: error })
        }
      } finally {
        setIsLoadingFreelancers(false) // Finaliza o loading
      }
    }
    fetchFreelancers()
  }, [runId])

  // Buscar usuários para o AUTOCOMPLETE
  useEffect(() => {
    if (!runId) return
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/freelancer/users/${runId}`)
        setUsers(response.data.info) // Popula o autocomplete
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError({
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          })
        } else {
          setError({ message: 'Erro inesperado', response: error })
        }
      }
    }
    fetchUsers()
  }, [runId])

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredUsers([])
      return
    }
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [search, users])

  const handleUserSelect = (user: User) => {
    setSelectedUser(user) // Armazena o objeto inteiro
    setSearch(user.username)
    setFilteredUsers([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)

    if (value === '') {
      setSelectedUser(null)
    }
  }

  const handleAddFreelancer = async () => {
    if (!selectedUser || !runId) return

    setIsSubmitting(true)
    const payload = { id_discord: selectedUser.id_discord, id_run: runId } // Altere para id_discord
    try {
      await api.post('/freelancer', payload)

      // Atualiza a tabela após adicionar
      const response = await api.get(`/freelancers/${runId}`)
      setFreelancers(response.data.info || [])

      setSearch('')
      setSelectedUser(null)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({ message: 'Erro inesperado', response: error })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFreelancer = async (id_discord: string) => {
    if (!runId) return

    const confirmation = window.confirm(
      'Are you sure you want to remove this freelancer?'
    )
    if (!confirmation) return

    setIsSubmitting(true)

    try {
      // Chama a API para excluir o freelancer
      await api.delete(`/freelancer/id_discord/${id_discord}/run/${runId}`)

      // Atualiza a lista de freelancers após a exclusão
      const response = await api.get(`/freelancers/${runId}`)
      setFreelancers(response.data.info || [])
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({ message: 'Erro inesperado', response: error })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAttendanceClick = async (
    id_discord: string,
    percentage: number
  ) => {
    if (!runId) return

    setIsLoadingAttendance(true) // Inicia o loading

    const payload = {
      id_discord,
      id_run: runId,
      percentage: percentage,
    }

    try {
      // Chama a API PUT para atualizar a porcentagem de um freelancer
      await api.put('/freelancer', payload)

      // Atualiza a tabela ou qualquer outro dado necessário após a atualização
      const updatedFreelancers = freelancers.map((freelancer) =>
        freelancer.id_discord === id_discord
          ? { ...freelancer, percentage: percentage }
          : freelancer
      )
      setFreelancers(updatedFreelancers)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError({
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        })
      } else {
        setError({ message: 'Erro inesperado', response: error })
      }
    } finally {
      setIsLoadingAttendance(false) // Finaliza o loading
    }
  }

  if (error) {
    return (
      <Modal onClose={() => setError(null)}>
        <ErrorComponent error={error} onClose={() => setError(null)} />
      </Modal>
    )
  }

  const getColorForPercentage = (percentage: number) => {
    if (percentage === 0) return 'bg-red-500 text-white'
    if (percentage === 100) return 'bg-green-500 text-white'
    return 'bg-yellow-500 text-white'
  }

  return (
    <div className='w-[50%] mx-auto mt-2 p-4'>
      <div className='flex flex-col items-center'>
        <div className='relative flex gap-2 mb-2 w-[80%]'>
          <input
            className='p-1 rounded-md text-black w-full'
            type='text'
            placeholder='Player'
            value={search}
            onChange={handleInputChange}
          />
          <button
            className={`bg-red-400 p-1 px-2 rounded-md ${
              !selectedUser ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleAddFreelancer}
            disabled={!selectedUser || isSubmitting}
          >
            {isSubmitting ? <CircleNotch className='animate-spin' /> : 'ADD'}
          </button>

          {filteredUsers.length > 0 && (
            <ul className='absolute top-10 left-0 w-full text-black bg-white border rounded shadow-lg z-10'>
              {filteredUsers.map((user) => (
                <li
                  key={user.id_discord}
                  className='p-2 cursor-pointer hover:bg-gray-200'
                  onClick={() => handleUserSelect(user)}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tabela de freelancers populada pela API */}
        <table className='w-[80%] border-collapse'>
          <thead className='table-header-group'>
            <tr className='text-md bg-zinc-400 text-gray-700'>
              <th className='p-2 border'>Freelancer</th>
              <th className='p-2 border flex items-center justify-center'>
                Attendance
              </th>
              <th className='p-2 border'>Delete</th>
            </tr>
          </thead>
          <tbody className='table-row-group text-sm font-medium text-zinc-900 bg-zinc-200'>
            {isLoadingFreelancers ? (
              <tr>
                <td colSpan={3} className='text-center p-4'>
                  <div className='inline-block'>
                    <CircleNotch className='animate-spin text-gray-600' />
                  </div>
                </td>
              </tr>
            ) : freelancers.length === 0 ? (
              <tr>
                <td colSpan={3} className='text-center p-4 text-gray-500'>
                  No Freelancer
                </td>
              </tr>
            ) : (
              freelancers.map((user) => (
                <tr key={user.id_discord} className='border border-gray-300'>
                  <td className='p-2 text-center'>{user.username}</td>
                  <td className='p-2 text-center'>
                    <div className='flex gap-2 px-2 items-center justify-center'>
                      <select
                        value={user.percentage}
                        onChange={(e) =>
                          handleAttendanceClick(
                            user.id_discord,
                            Number(e.target.value)
                          )
                        }
                        className={`px-2 py-1 text-xs border rounded transition-colors ${getColorForPercentage(
                          user.percentage
                        )}`}
                      >
                        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                          (value) => (
                            <option
                              key={value}
                              value={value}
                              className='bg-white text-zinc-900'
                            >
                              {value}%
                            </option>
                          )
                        )}
                      </select>
                      {isLoadingAttendance && (
                        <CircleNotch className='animate-spin text-gray-600' />
                      )}
                    </div>
                  </td>
                  <td className='p-2 text-center'>
                    <button
                      onClick={() => handleDeleteFreelancer(user.id_discord)}
                    >
                      {isSubmitting ? (
                        <CircleNotch className='animate-spin' />
                      ) : (
                        <Trash />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
