import {
  Coins,
  Briefcase,
  CalendarBlank,
  CaretUp,
  CaretDown,
  CastleTurret,
  Church,
  Hourglass,
  SignOut,
  UsersFour,
  CheckCircle,
} from '@phosphor-icons/react'
import { Button } from './button'
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
      <header className='h-[60px] bg-zinc-900 flex items-center justify-center pl-4 font-bold text-3xl text-gray-100 shadow-bottom-strong z-10 relative'>
        TheBakers <span className='text-red-700 '>Hub</span>
      </header>
    )
  }

  return (
    <header className='h-[60px] bg-zinc-900 flex gap-40 items-center pl-4 font-bold text-2xl text-gray-100 shadow-bottom-strong z-10 relative'>
      <Button onClick={() => navigate('/home')} variant='home'>
        TheBakers <span className='text-red-700 '>Hub</span>
      </Button>
      <Button onClick={() => navigate('/balance')} variant='header'>
        <Coins className='text-gray-100' size={30} />
        Balance
      </Button>

      <div
        onMouseEnter={() => setIsHoveringManagement(true)}
        onMouseLeave={() => setIsHoveringManagement(false)}
        className='relative'
      >
        <Button variant='header'>
          <Briefcase className='text-gray-100' size={30} />
          Management
          {isHoveringManagement ? (
            <CaretUp className='text-red-400' size={20} />
          ) : (
            <CaretDown className='text-red-400' size={20} />
          )}
        </Button>

        {/* Dropdown abaixo do header */}
        {isHoveringManagement && (
          <div className='absolute left-0 w-full bg-zinc-800 shadow-lg rounded-xl'>
            <Button
              onClick={() => navigate('/management-teams')}
              variant='header'
            >
              <UsersFour className='text-gray-100' size={30} />
              Teams
            </Button>
            <Button onClick={() => navigate('/freelancers')} variant='header'>
              <CheckCircle className='text-gray-100' size={30} />
              Attendance
            </Button>
          </div>
        )}
      </div>
      <div
        onMouseEnter={() => setIsHoveringNA(true)}
        onMouseLeave={() => setIsHoveringNA(false)}
        className='relative'
      >
        <Button variant='header'>
          <CalendarBlank className='text-gray-100' size={30} />
          Bookings (NA)
          {isHoveringNA ? (
            <CaretUp className='text-red-400' size={20} />
          ) : (
            <CaretDown className='text-red-400' size={20} />
          )}
        </Button>

        {/* Dropdown abaixo do header */}
        {isHoveringNA && (
          <div className='absolute left-0 w-full bg-zinc-800 shadow-lg rounded-xl'>
            <Button onClick={() => navigate('/full-raids-na')} variant='header'>
              <CastleTurret className='text-gray-100' size={30} />
              Full Raids
            </Button>
            <Button onClick={() => navigate('/curves-na')} variant='header'>
              <Church className='text-gray-100' size={30} />
              Curves
            </Button>
            <Button
              onClick={() => navigate('/mythic-raids-na')}
              variant='header'
            >
              <CastleTurret className='text-gray-100' size={30} weight='fill' />
              Mythic Raids
            </Button>
            <Button onClick={() => navigate('/legacy-na')} variant='header'>
              <Hourglass className='text-gray-100' size={30} />
              Legacy
            </Button>
          </div>
        )}
      </div>
      <Button onClick={handleLogout} variant='header'>
        <SignOut className='text-gray-100' size={30} />
        Logout
      </Button>
    </header>
  )
}
