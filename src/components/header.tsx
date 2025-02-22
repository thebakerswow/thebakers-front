import {
  Coins,
  Briefcase,
  CalendarBlank,
  CaretUp,
  CaretDown,
  CastleTurret,
  SignOut,
  UsersFour,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/auth-context'

export function Header() {
  const navigate = useNavigate()
  const { logout, isAuthenticated, userRoles } = useAuth()
  const [isHoveringNA, setIsHoveringNA] = useState(false)
  const [isHoveringManagement, setIsHoveringManagement] = useState(false)

  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!isAuthenticated) {
    return (
      <header className='h-[60px] bg-zinc-900 flex items-center justify-center pl-4 font-bold text-3xl text-gray-100 shadow-bottom-strong z-10 relative'>
        TheBakers <span className='text-red-700'>Hub</span>
      </header>
    )
  }

  return (
    <header className='h-[60px] bg-zinc-900 flex gap-40 justify-evenly items-center pl-4 font-bold text-2xl text-gray-100 shadow-bottom-strong z-10 relative'>
      <button className='text-3xl font-bold' onClick={() => navigate('/home')}>
        TheBakers <span className='text-red-700'>Hub</span>
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

        {isHoveringManagement && (
          <div className='absolute left-0 w-full bg-zinc-800 shadow-lg rounded-xl flex flex-col items-center py-4 gap-4'>
            {hasRequiredRole(['1101231955120496650']) && (
              <button
                className='text-gray-300 flex gap-4 text-lg font-semibold pl-5 w-full items-center'
                onClick={() => navigate('/admin')}
              >
                <Briefcase className='text-gray-100' size={30} />
                Admin
              </button>
            )}
            {/* chefe de cozinha */}
            {hasRequiredRole(['1101231955120496650']) && (
              <button
                className='text-gray-300 flex gap-4 text-lg font-semibold pl-5 w-full items-center'
                onClick={() => navigate('/management-teams')}
              >
                <UsersFour className='text-gray-100' size={30} />
                Teams
              </button>
            )}
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

        {isHoveringNA && (
          <div className='absolute left-0 w-full bg-zinc-800 shadow-lg rounded-xl flex flex-col items-center py-4 gap-4'>
            <button
              className='text-gray-300 flex gap-4 text-lg font-semibold pl-5 w-full items-center'
              onClick={() => navigate('/bookings-na')}
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
