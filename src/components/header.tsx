import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Coins,
  Briefcase,
  CalendarBlank,
  SignOut,
  UsersFour,
  List,
  Key,
  ArrowFatUp,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/auth-context'

// Componente para mostrar o horário EST em tempo real
function EstClock() {
  const [time, setTime] = useState<string>('')

  // Atualiza o horário a cada segundo
  useEffect(() => {
    const update = () => {
      const now = new Date()
      // Converte para o fuso horário EST (America/New_York)
      const estTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/New_York',
      })
      setTime(estTime)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Typography
      variant='body2'
      sx={{ fontWeight: 500, fontSize: '1.1rem', minWidth: '180px' }}
    >
      EST Timezone: {time}
    </Typography>
  )
}

export function Header() {
  const navigate = useNavigate()
  const { logout, isAuthenticated, userRoles } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [bookingsAnchorEl, setBookingsAnchorEl] = useState<null | HTMLElement>(
    null
  )

  const hasAccess = (requiredRoles: string[], exactMatch = false): boolean => {
    if (exactMatch) {
      return (
        requiredRoles.every((role) => userRoles.includes(role)) &&
        userRoles.length === requiredRoles.length
      )
    }
    return requiredRoles.some((role) => userRoles.includes(role))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleBookingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setBookingsAnchorEl(event.currentTarget)
  }

  const handleBookingsMenuClose = () => {
    setBookingsAnchorEl(null)
  }

  if (!isAuthenticated) {
    return (
      <AppBar
        position='static'
        sx={{
          background: 'linear-gradient(to right, black, #333)',
          zIndex: 1000,
        }}
      >
        <Toolbar>
          {/* EST Clock na esquerda */}
          <EstClock />
          <Typography
            variant='h6'
            component='div'
            sx={{
              fontSize: '1.8rem',
              textAlign: 'center',
              flexGrow: 1,
              cursor: 'pointer',
              marginRight: '200px',
            }}
            onClick={() => navigate('/')}
          >
            TheBakers{' '}
            <span className='font-extrabold text-purple-500'>Hub</span>
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <AppBar
      position='static'
      sx={{
        background: 'linear-gradient(to right, black, #333)',
        zIndex: 1000,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-around' }}>
        {/* EST Clock na esquerda */}
        <EstClock />
        <Typography
          variant='h6'
          component='div'
          sx={{ cursor: 'pointer', fontSize: '1.8rem' }}
          onClick={() => navigate('/home')}
        >
          TheBakers <span className='font-extrabold text-purple-500'>Hub</span>
        </Typography>

        <Button
          color='inherit'
          onClick={() => navigate('/balance')}
          startIcon={<Coins size={20} />}
        >
          Balance
        </Button>

        {hasAccess([import.meta.env.VITE_TEAM_CHEFE]) && (
          <>
            <Button
              color='inherit'
              onClick={handleMenuOpen}
              startIcon={<Briefcase size={20} />}
            >
              Management
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{
                zIndex: 99999,
                '& .MuiPaper-root': {
                  zIndex: 99999,
                },
                '& .MuiBackdrop-root': {
                  zIndex: 99998,
                },
              }}
              slotProps={{
                paper: {
                  sx: {
                    width: '150px',
                    zIndex: 99999,
                    position: 'relative',
                  },
                },
              }}
              style={{ zIndex: 99999 }}
            >
              <MenuItem
                onClick={() => {
                  navigate('/admin')
                  handleMenuClose()
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Briefcase size={20} />
                Admin
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate('/management-teams')
                  handleMenuClose()
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <UsersFour size={20} />
                Teams
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate('/services')
                  handleMenuClose()
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CalendarBlank size={20} />
                Services
              </MenuItem>
            </Menu>
          </>
        )}

        {/* Bookings (NA) Dropdown */}
        {!hasAccess([import.meta.env.VITE_TEAM_FREELANCER], true) && (
          <Button
            color='inherit'
            onClick={handleBookingsMenuOpen}
            startIcon={<CalendarBlank size={20} />}
          >
            Bookings (NA)
          </Button>
        )}

        <Menu
          anchorEl={bookingsAnchorEl}
          open={Boolean(bookingsAnchorEl)}
          onClose={handleBookingsMenuClose}
          sx={{
            zIndex: 99999,
            '& .MuiPaper-root': {
              zIndex: 99999,
            },
            '& .MuiBackdrop-root': {
              zIndex: 99998,
            },
          }}
          slotProps={{
            paper: {
              sx: {
                width: '150px',
                zIndex: 99999,
                position: 'relative',
              },
            },
          }}
          style={{ zIndex: 99999 }}
        >
          <MenuItem
            onClick={() => {
              navigate('/bookings-na')
              handleBookingsMenuClose()
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <List size={20} /> Full Raids
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate('/keys')
              handleBookingsMenuClose()
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Key size={20} /> Keys
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate('/leveling')
              handleBookingsMenuClose()
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowFatUp size={20} /> Leveling
          </MenuItem>
        </Menu>

        <Button
          color='inherit'
          onClick={handleLogout}
          startIcon={<SignOut size={20} />}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}
