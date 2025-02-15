import {
  Coins,
  Briefcase,
  CalendarBlank,
  CaretUp,
  CaretDown,
  CastleTurret,
  SignOut,
  UsersFour,
  CheckCircle,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/auth-context' // Para utilizar o contexto de autenticação

export function Header() {
  const navigate = useNavigate()
  const { logout, isAuthenticated } = useAuth() // Acessa a função de logout e a autenticação do contexto
  const [isHoveringNA, setIsHoveringNA] = useState(false)
  const [isHoveringManagement, setIsHoveringManagement] = useState(false)

  const handleLogout = () => {
    logout() // Chama a função de logout
    navigate('/') // Redireciona para a página de login após o logout
  }

  // Exibe o header com os botões de menu apenas se o usuário estiver autenticado
  if (!isAuthenticated) {
    return (
      <header
        className='h-[60px] bg-zinc-900 flex items-center justify-center pl-4 font-bold text-3xl text-gray-100 
      shadow-bottom-strong z-10 relative'
      >
        TheBakers <span className='text-red-700 '>Hub</span>
      </header>
    )
  }

  return (
    <header className='h-[60px] bg-zinc-900 flex gap-40 justify-evenly items-center pl-4 font-bold text-2xl text-gray-100 shadow-bottom-strong z-10 relative'>
      <button className='text-3xl font-bold' onClick={() => navigate('/home')}>
        TheBakers <span className='text-red-700 '>Hub</span>
      </button>
      <button
        className='text-gray-300 flex gap-4 text-lg font-semibold'
        onClick={() => navigate('/balance')}
      >
        <Coins className='text-gray-100' size={30} />
        Balance
      </button>

      <div
        onMouseEnter={() => setIsHoveringManagement(true)}
        onMouseLeave={() => setIsHoveringManagement(false)}
        className='relative'
      >
        <button className='text-gray-300 flex gap-4 text-lg font-semibold items-center'>
          <Briefcase className='text-gray-100' size={30} />
          Management
          {isHoveringManagement ? (
            <CaretUp className='text-red-400' size={20} />
          ) : (
            <CaretDown className='text-red-400' size={20} />
          )}
        </button>
        {/* Dropdown abaixo do header */}
        {isHoveringManagement && (
          <div className='absolute left-0 w-full bg-zinc-800 shadow-lg rounded-xl flex flex-col items-center py-4 gap-4'>
            <button
              className='text-gray-300 flex gap-4 text-lg font-semibold pl-5 w-full items-center'
              onClick={() => navigate('/management-teams')}
            >
              <UsersFour className='text-gray-100' size={30} />
              Teams
            </button>
            <button
              className='text-gray-300 flex gap-4 text-lg font-semibold w-full items-center pl-5'
              onClick={() => navigate('/freelancers')}
            >
              <CheckCircle className='text-gray-100' size={30} />
              Attendance
            </button>
          </div>
        )}
      </div>
      <div
        onMouseEnter={() => setIsHoveringNA(true)}
        onMouseLeave={() => setIsHoveringNA(false)}
        className='relative'
      >
        <button className='text-gray-300 flex gap-4 text-lg font-semibold pl-5 w-full items-center'>
          <CalendarBlank className='text-gray-100' size={30} />
          Bookings (NA)
          {isHoveringNA ? (
            <CaretUp className='text-red-400' size={20} />
          ) : (
            <CaretDown className='text-red-400' size={20} />
          )}
        </button>

        {/* Dropdown abaixo do header */}
        {isHoveringNA && (
          <div className='absolute left-0 w-full bg-zinc-800 shadow-lg rounded-xl flex flex-col items-center py-4 gap-4'>
            <button
              className='text-gray-300 flex gap-4 text-lg font-semibold pl-5 w-full items-center'
              onClick={() => navigate('/full-raids-na')}
            >
              <CastleTurret className='text-gray-100' size={30} />
              Full Raids
            </button>
          </div>
        )}
      </div>
      <button
        className='text-gray-300 flex gap-4 text-lg font-semibold'
        onClick={handleLogout}
      >
        <SignOut className='text-gray-100' size={30} />
        Logout
      </button>
    </header>
  )
}
