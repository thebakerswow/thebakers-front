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
      <header className='relative z-10 flex h-[60px] items-center justify-center bg-zinc-900 pl-4 text-3xl font-bold text-gray-100 shadow-bottom-strong'>
        TheBakers <span className='text-red-700'>Hub</span>
      </header>
    )
  }

  return (
    <header className='relative z-10 flex h-[60px] items-center justify-evenly gap-40 bg-zinc-900 pl-4 text-2xl font-bold text-gray-100 shadow-bottom-strong'>
      <button className='text-3xl font-bold' onClick={() => navigate('/home')}>
        TheBakers <span className='text-red-700'>Hub</span>
      </button>

      <button
        className='flex gap-4 text-lg font-semibold text-gray-300'
        onClick={() => navigate('/balance')}
      >
        <Coins className='text-gray-100' size={30} />
        Balance
      </button>

      {hasRequiredRole(['1101231955120496650']) && (
        <div
          onMouseEnter={() => setIsHoveringManagement(true)}
          onMouseLeave={() => setIsHoveringManagement(false)}
          className='relative'
        >
          <button className='flex items-center gap-4 text-lg font-semibold text-gray-300'>
            <Briefcase className='text-gray-100' size={30} />
            Management
            {isHoveringManagement ? (
              <CaretUp className='text-red-400' size={20} />
            ) : (
              <CaretDown className='text-red-400' size={20} />
            )}
          </button>

          {isHoveringManagement && (
            <div className='absolute left-0 flex w-full flex-col items-center gap-4 rounded-xl bg-zinc-800 py-4 shadow-lg'>
              <button
                className='flex w-full items-center gap-4 pl-5 text-lg font-semibold text-gray-300'
                onClick={() => navigate('/admin')}
              >
                <Briefcase className='text-gray-100' size={30} />
                Admin
              </button>
              <button
                className='flex w-full items-center gap-4 pl-5 text-lg font-semibold text-gray-300'
                onClick={() => navigate('/management-teams')}
              >
                <UsersFour className='text-gray-100' size={30} />
                Teams
              </button>
            </div>
          )}
        </div>
      )}

      <div
        onMouseEnter={() => setIsHoveringNA(true)}
        onMouseLeave={() => setIsHoveringNA(false)}
        className='relative'
      >
        <button className='flex w-full items-center gap-4 pl-5 text-lg font-semibold text-gray-300'>
          <CalendarBlank className='text-gray-100' size={30} />
          Bookings (NA)
          {isHoveringNA ? (
            <CaretUp className='text-red-400' size={20} />
          ) : (
            <CaretDown className='text-red-400' size={20} />
          )}
        </button>

        {isHoveringNA && (
          <div className='absolute left-0 flex w-full flex-col items-center gap-4 rounded-xl bg-zinc-800 py-4 shadow-lg'>
            <button
              className='flex w-full items-center gap-4 pl-5 text-lg font-semibold text-gray-300'
              onClick={() => navigate('/bookings-na')}
            >
              <CastleTurret className='text-gray-100' size={30} />
              Full Raids
            </button>
          </div>
        )}
      </div>

      <button
        className='flex gap-4 text-lg font-semibold text-gray-300'
        onClick={handleLogout}
      >
        <SignOut className='text-gray-100' size={30} />
        Logout
      </button>
    </header>
  )
}
