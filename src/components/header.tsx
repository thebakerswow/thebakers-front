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
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/auth-context'

export function Header() {
  const navigate = useNavigate()
  const { logout, isAuthenticated, userRoles } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole.toString() === required.toString())
    )
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

  if (!isAuthenticated) {
    return (
      <AppBar
        position='static'
        sx={{ background: 'linear-gradient(to right, black, #333)' }}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography
            variant='h6'
            component='div'
            sx={{ fontSize: '1.8rem', textAlign: 'center' }}
          >
            TheBakers <span style={{ color: 'red' }}>Hub</span>
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <AppBar
      position='static'
      sx={{ background: 'linear-gradient(to right, black, #333)' }}
    >
      <Toolbar sx={{ justifyContent: 'space-around' }}>
        <Typography
          variant='h6'
          component='div'
          sx={{ cursor: 'pointer', fontSize: '1.8rem' }}
          onClick={() => navigate('/home')}
        >
          TheBakers <span style={{ color: 'red' }}>Hub</span>
        </Typography>

        <Button
          color='inherit'
          onClick={() => navigate('/balance')}
          startIcon={<Coins size={20} />}
        >
          Balance
        </Button>

        {hasRequiredRole(['1101231955120496650']) && (
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
              slotProps={{
                paper: {
                  sx: { width: '150px' }, // Adjust the width as needed
                },
              }}
            >
              <MenuItem
                onClick={() => navigate('/admin')}
                sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Briefcase size={20} />
                Admin
              </MenuItem>
              <MenuItem
                onClick={() => navigate('/management-teams')}
                sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <UsersFour size={20} />
                Teams
              </MenuItem>
            </Menu>
          </>
        )}

        <Button
          color='inherit'
          onClick={() => navigate('/bookings-na')}
          startIcon={<CalendarBlank size={20} />}
        >
          Full Raids (NA)
        </Button>

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
