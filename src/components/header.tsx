import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Coins,
  Briefcase,
  CalendarBlank,
  SignOut,
  UsersFour,
  List as ListIcon,
  Key,
  ArrowFatUp,
} from '@phosphor-icons/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/auth-context'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, isAuthenticated, userRoles } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [bookingsAnchorEl, setBookingsAnchorEl] = useState<null | HTMLElement>(
    null
  )
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileBookingsAnchorEl, setMobileBookingsAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileManagementAnchorEl, setMobileManagementAnchorEl] = useState<null | HTMLElement>(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Verifica se está no domínio externo (vitrine)
  const isExternalDomain = () => {
    // Se estiver em rotas /external, é página externa
    if (location.pathname.startsWith('/external')) return true

    // Se o hostname for diferente do domínio principal, é domínio externo
    const currentHost = window.location.hostname
    const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || 'localhost'

    // Remove 'www.' de ambos os hostnames para comparação
    const normalizedCurrentHost = currentHost.replace(/^www\./, '')
    const normalizedMainDomain = mainDomain.replace(/^www\./, '')

    return (
      normalizedCurrentHost !== normalizedMainDomain &&
      normalizedCurrentHost !== 'localhost'
    )
  }

  const isExternalPage = isExternalDomain()

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
    setMobileMenuAnchorEl(null)
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

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null)
  }

  const handleMobileBookingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileBookingsAnchorEl(event.currentTarget)
  }

  const handleMobileBookingsMenuClose = () => {
    setMobileBookingsAnchorEl(null)
  }

  const handleMobileManagementMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileManagementAnchorEl(event.currentTarget)
  }

  const handleMobileManagementMenuClose = () => {
    setMobileManagementAnchorEl(null)
  }

  const handleMobileNavigation = (path: string) => {
    navigate(path)
    setMobileMenuAnchorEl(null)
    setMobileBookingsAnchorEl(null)
    setMobileManagementAnchorEl(null)
  }

  // Se não está autenticado e não é página externa, mostra header de login
  if (!isAuthenticated && !isExternalPage) {
    return (
      <AppBar
        position='static'
        sx={{
          background: 'black',
          zIndex: 1000,
        }}
      >
        <Toolbar>
          <Typography
            variant='h6'
            component='div'
            sx={{
              fontSize: '1.8rem',
              textAlign: 'center',
              flexGrow: 1,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            TheBakers
            <span className='font-extrabold text-purple-500'>Hub</span>
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  // Se é página externa, mostra header simplificado
  if (isExternalPage) {
    return (
      <AppBar
        position='static'
        sx={{
          background: 'black',
          zIndex: 1000,
        }}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography
            variant='h6'
            component='div'
            sx={{
              cursor: 'pointer',
              fontSize: '1.8rem',
              textAlign: 'center',
            }}
            onClick={() => navigate('/')}
          >
            Corn<span className='font-extrabold text-purple-500'>Field</span>
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <>
      <AppBar
        position='static'
        sx={{
          background: 'black',
          zIndex: 1000,
        }}
      >
        <Toolbar sx={{ justifyContent: isMobile ? 'space-between' : 'space-around' }}>
          <Typography
            variant='h6'
            component='div'
            sx={{ 
              cursor: 'pointer', 
              fontSize: isMobile ? '1.5rem' : '1.8rem',
              flexGrow: isMobile ? 1 : 0
            }}
            onClick={() => navigate('/home')}
          >
            TheBakers<span className='font-extrabold text-purple-500'>Hub</span>
          </Typography>

          {isMobile ? (
            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              sx={{ ml: 'auto' }}
            >
              <ListIcon size={24} />
            </IconButton>
          ) : (
            <>
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
                  <ListIcon size={20} /> Full Raids
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
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Menu Mobile Flutuante */}
      <Menu
        anchorEl={mobileMenuAnchorEl}
        open={Boolean(mobileMenuAnchorEl)}
        onClose={handleMobileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            background: 'black',
            color: 'white',
            width: 250,
            mt: 1,
          },
          zIndex: 99999,
        }}
      >
        <MenuItem
          onClick={() => handleMobileNavigation('/home')}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: 1.5 }}
        >
          <Briefcase size={20} />
          Home
        </MenuItem>

        <MenuItem
          onClick={() => handleMobileNavigation('/balance')}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: 1.5 }}
        >
          <Coins size={20} />
          Balance
        </MenuItem>

        {hasAccess([import.meta.env.VITE_TEAM_CHEFE]) && (
          <MenuItem
            onClick={handleMobileManagementMenuOpen}
            sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: 1.5 }}
          >
            <Briefcase size={20} />
            Management
          </MenuItem>
        )}

        {!hasAccess([import.meta.env.VITE_TEAM_FREELANCER], true) && (
          <MenuItem
            onClick={handleMobileBookingsMenuOpen}
            sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: 1.5 }}
          >
            <CalendarBlank size={20} />
            Bookings (NA)
          </MenuItem>
        )}

        <MenuItem
          onClick={handleLogout}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px', py: 1.5 }}
        >
          <SignOut size={20} />
          Logout
        </MenuItem>
      </Menu>

      {/* Submenu Management Mobile */}
      <Menu
        anchorEl={mobileManagementAnchorEl}
        open={Boolean(mobileManagementAnchorEl)}
        onClose={handleMobileManagementMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            background: 'black',
            color: 'white',
            width: 200,
          },
          zIndex: 99999,
        }}
      >
        <MenuItem
          onClick={() => handleMobileNavigation('/admin')}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Briefcase size={20} />
          Admin
        </MenuItem>
        <MenuItem
          onClick={() => handleMobileNavigation('/management-teams')}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UsersFour size={20} />
          Teams
        </MenuItem>
        <MenuItem
          onClick={() => handleMobileNavigation('/services')}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <CalendarBlank size={20} />
          Services
        </MenuItem>
      </Menu>

      {/* Submenu Bookings Mobile */}
      <Menu
        anchorEl={mobileBookingsAnchorEl}
        open={Boolean(mobileBookingsAnchorEl)}
        onClose={handleMobileBookingsMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            background: 'black',
            color: 'white',
            width: 200,
          },
          zIndex: 99999,
        }}
      >
        <MenuItem
          onClick={() => handleMobileNavigation('/bookings-na')}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ListIcon size={20} />
          Full Raids
        </MenuItem>
        <MenuItem
          onClick={() => handleMobileNavigation('/keys')}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Key size={20} />
          Keys
        </MenuItem>
        <MenuItem
          onClick={() => handleMobileNavigation('/leveling')}
          sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowFatUp size={20} />
          Leveling
        </MenuItem>
      </Menu>
    </>
  )
}
