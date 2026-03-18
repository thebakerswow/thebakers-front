import { cloneElement, isValidElement, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowFatUp,
  Briefcase,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  CaretDown,
  Coins,
  CurrencyDollar,
  Key,
  List as ListIcon,
  List,
  Mountains,
  SignOut,
  Sword,
  Trophy,
  User,
  X,
  ClipboardText,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import {
  isOnlyFreelancer,
  shouldShowBookingsTab,
  shouldShowSellsTab,
  shouldUseNewBalance,
} from '../utils/roleUtils'

type NavItem = {
  label: string
  path?: string
  activePaths?: string[]
  activeMatchPaths?: string[]
  activeExactPaths?: string[]
  icon: JSX.Element
  children?: NavItem[]
}

const sidebarListVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, isAuthenticated, userRoles } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktopSidebarHidden, setIsDesktopSidebarHidden] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    finances: true,
    bookings: true,
    management: true,
  })
  const isAdminPage = location.pathname.startsWith('/admin')

  useEffect(() => {
    setIsDesktopSidebarHidden(isAdminPage)
  }, [isAdminPage])

  const hasAccess = (requiredRoles: string[], exactMatch = false): boolean => {
    if (exactMatch) {
      return (
        requiredRoles.every((role) => userRoles.includes(role)) &&
        userRoles.length === requiredRoles.length
      )
    }
    return requiredRoles.some((role) => userRoles.includes(role))
  }
  const isFreelancerOnlyUser = isOnlyFreelancer(userRoles)
  const hasMplusKeysAccess = hasAccess([
    import.meta.env.VITE_TEAM_MPLUS_SOLO,
    import.meta.env.VITE_TEAM_MPLUS_TEAM,
  ])
  const hasLevelingAccess = hasAccess([import.meta.env.VITE_TEAM_LEVELING])
  const hasAchievementsAccess = hasAccess([import.meta.env.VITE_TEAM_ACHIEVEMENTS])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileOpen(false)
  }

  const goTo = (path: string) => {
    navigate(path)
    setIsMobileOpen(false)
  }

  const navItems: NavItem[] = isFreelancerOnlyUser
    ? [{ label: 'Balance', path: '/balance', icon: <Coins size={18} /> }]
    : [
        { label: 'Home', path: '/home', icon: <Briefcase size={18} /> },
        {
          label: 'Finances',
          icon: <CurrencyDollar size={18} />,
          children: [
            { label: 'Balance', path: '/balance', icon: <Coins size={18} /> },
            ...(shouldShowSellsTab(userRoles)
              ? [{ label: 'Sells', path: '/sells', icon: <CurrencyDollar size={18} /> }]
              : []),
            ...(shouldUseNewBalance(userRoles)
              ? [{ label: 'My Requests', path: '/my-requests', icon: <User size={18} /> }]
              : []),
          ],
        },
        ...(hasAccess([import.meta.env.VITE_TEAM_CHEFE])
          ? [
              {
                label: 'Management',
                icon: <Briefcase size={18} />,
                children: [
                  { label: 'Admin', path: '/admin', icon: <Briefcase size={18} /> },
                  {
                    label: 'Services',
                    path: '/services',
                    icon: <CalendarBlank size={18} />,
                  },
                  {
                    label: 'Requests',
                    path: '/requests',
                    icon: <ClipboardText size={18} />,
                  },
                  {
                    label: 'Gold',
                    path: '/payments',
                    icon: <CurrencyDollar size={18} />,
                  },
                  {
                    label: 'Dollar',
                    path: '/dollar-payments',
                    icon: <CurrencyDollar size={18} />,
                  },
                ],
              },
            ]
          : []),
        ...(shouldShowBookingsTab(userRoles) ||
        hasMplusKeysAccess ||
        hasLevelingAccess ||
        hasAchievementsAccess
          ? [
              {
                label: 'Bookings (NA)',
                icon: <CalendarBlank size={18} />,
                children: [
                  ...(shouldShowBookingsTab(userRoles)
                    ? [
                        {
                          label: 'Raids',
                          path: '/bookings-na/raids',
                          activeExactPaths: ['/bookings-na/raids'],
                          activeMatchPaths: ['/bookings-na/run'],
                          activePaths: ['/bookings-na/run'],
                          icon: <ListIcon size={18} />,
                        },
                      ]
                    : []),
                  ...(shouldShowBookingsTab(userRoles) || hasMplusKeysAccess
                    ? [
                        {
                          label: 'Keys',
                          path: '/keys',
                          activeExactPaths: ['/keys', '/bookings-na/keys'],
                          activeMatchPaths: ['/keys', '/bookings-na/key', '/bookings-na/keys'],
                          activePaths: ['/bookings-na/key'],
                          icon: <Key size={18} />,
                        },
                      ]
                    : []),
                  ...(shouldShowBookingsTab(userRoles) || hasLevelingAccess
                    ? [
                        {
                          label: 'Leveling',
                          path: '/leveling',
                          activeExactPaths: ['/leveling', '/bookings-na/leveling'],
                          activeMatchPaths: ['/leveling', '/bookings-na/leveling'],
                          activePaths: ['/bookings-na/leveling'],
                          icon: <ArrowFatUp size={18} />,
                        },
                      ]
                    : []),
                  ...(shouldShowBookingsTab(userRoles) || hasMplusKeysAccess
                    ? [
                        {
                          label: 'Delves',
                          path: '/delves',
                          activeExactPaths: ['/delves', '/bookings-na/delves'],
                          activeMatchPaths: ['/delves', '/bookings-na/delves'],
                          activePaths: ['/bookings-na/delves'],
                          icon: <Mountains size={18} />,
                        },
                      ]
                    : []),
                  ...(shouldShowBookingsTab(userRoles) || hasAchievementsAccess
                    ? [
                        {
                          label: 'Achievements',
                          path: '/achievements',
                          activeExactPaths: ['/achievements', '/bookings-na/achievements'],
                          activeMatchPaths: ['/achievements', '/bookings-na/achievements'],
                          activePaths: ['/bookings-na/achievements'],
                          icon: <Trophy size={18} />,
                        },
                      ]
                    : []),
                  ...(shouldShowBookingsTab(userRoles) || hasMplusKeysAccess
                    ? [
                        {
                          label: 'PvP',
                          path: '/pvp',
                          activeExactPaths: ['/pvp', '/bookings-na/pvp'],
                          activeMatchPaths: ['/pvp', '/bookings-na/pvp'],
                          activePaths: ['/bookings-na/pvp'],
                          icon: <Sword size={18} />,
                        },
                      ]
                    : []),
                ],
              },
            ]
          : []),
      ]

  if (!isAuthenticated) return null

  return (
    <>
      <div className='fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#060608]/90 px-4 py-3 backdrop-blur-xl md:hidden'>
        <div className='flex items-center justify-between'>
          <button
            onClick={() => goTo('/home')}
            className='inline-flex items-center gap-2 text-base font-semibold uppercase tracking-[0.2em] text-white'
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <span>THE</span>
            <span className='text-xs text-purple-500'>●</span>
            <span>BAKERS</span>
          </button>
          <button
            onClick={() => setIsMobileOpen(true)}
            className='rounded-md border border-white/10 bg-white/5 p-2 text-white transition hover:border-purple-500/40 hover:text-purple-300'
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {isAdminPage && (
        <button
          type='button'
          onClick={() => setIsDesktopSidebarHidden((previous) => !previous)}
          aria-label={isDesktopSidebarHidden ? 'Show sidebar' : 'Hide sidebar'}
          className={`fixed top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-purple-300/50 bg-purple-500/25 text-white shadow-[0_0_20px_rgba(168,85,247,0.85),inset_0_0_12px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 hover:bg-purple-500/35 md:inline-flex ${
            isDesktopSidebarHidden ? 'left-2' : 'left-[15.25rem]'
          }`}
        >
          {isDesktopSidebarHidden ? (
            <CaretRight size={20} weight='bold' />
          ) : (
            <CaretLeft size={20} weight='bold' />
          )}
        </button>
      )}

      <aside
        className={`relative z-20 hidden w-64 shrink-0 border-r border-white/5 bg-[#0a0a0c] backdrop-blur-sm ${
          isDesktopSidebarHidden ? 'md:hidden' : 'md:flex md:flex-col'
        }`}
      >
        <div className='md:sticky md:top-0 md:flex md:h-screen md:flex-col'>
          <div className='flex h-full min-h-0 flex-col overflow-hidden'>
            <div className='relative flex shrink-0 items-center justify-center border-b border-white/5 px-6 py-8'>
              <motion.button
                onClick={() => goTo('/home')}
                className='inline-flex items-center justify-center gap-2 text-xl font-semibold uppercase tracking-[0.32em] text-white'
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
              >
                <span>THE</span>
                <span className='text-[10px] text-purple-500'>●</span>
                <span>BAKERS</span>
              </motion.button>
            </div>
            <motion.nav
              key={`desktop-sidebar-${location.pathname}`}
              initial='hidden'
              animate='visible'
              variants={sidebarListVariants}
              className='font-space-grotesk min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-2'
            >
              {navItems.map((item) => (
                <motion.div key={item.label} variants={sidebarItemVariants}>
                  <SidebarItem
                    item={item}
                    pathname={location.pathname}
                    open={openGroups[item.label.toLowerCase()] ?? true}
                    setOpen={(next) =>
                      setOpenGroups((prev) => ({ ...prev, [item.label.toLowerCase()]: next }))
                    }
                    onNavigate={goTo}
                  />
                </motion.div>
              ))}
              <motion.button
                variants={sidebarItemVariants}
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={handleLogout}
                className='flex w-full items-center gap-3 rounded-md border-l-2 border-transparent px-4 py-2.5 text-left text-sm text-gray-400 transition-all duration-200 hover:border-red-500 hover:bg-red-500/10 hover:text-white'
              >
                <SignOut size={18} />
                <span>Logout</span>
              </motion.button>
            </motion.nav>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className='fixed inset-0 z-50 md:hidden'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className='absolute inset-0 bg-black/60'
              onClick={() => setIsMobileOpen(false)}
              aria-label='Close sidebar backdrop'
            />
            <motion.aside
              className='absolute left-0 top-0 flex h-full w-[82%] max-w-[320px] flex-col border-r border-white/5 bg-[#0a0a0c]/95 p-4 backdrop-blur-sm'
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.5, ease: 'easeOut' }}
            >
              <div className='mb-4 flex items-center justify-between'>
                <motion.button
                  onClick={() => goTo('/home')}
                  className='inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-white'
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
                >
                  <span>THE</span>
                  <span className='text-[10px] text-purple-500'>●</span>
                  <span>BAKERS</span>
                </motion.button>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className='rounded-md border border-white/10 bg-white/5 p-2 text-white transition hover:border-purple-500/40 hover:text-purple-300'
                >
                  <X size={18} />
                </button>
              </div>

              <motion.nav
                key={`mobile-sidebar-${location.pathname}`}
                initial='hidden'
                animate='visible'
                variants={sidebarListVariants}
                className='font-space-grotesk flex-1 space-y-1 overflow-y-auto'
              >
                {navItems.map((item) => (
                  <motion.div key={`mobile-${item.label}`} variants={sidebarItemVariants}>
                    <SidebarItem
                      item={item}
                      pathname={location.pathname}
                      open={openGroups[item.label.toLowerCase()] ?? true}
                      setOpen={(next) =>
                        setOpenGroups((prev) => ({
                          ...prev,
                          [item.label.toLowerCase()]: next,
                        }))
                      }
                      onNavigate={goTo}
                    />
                  </motion.div>
                ))}
                <motion.button
                  variants={sidebarItemVariants}
                  whileHover={{ x: 3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={handleLogout}
                  className='flex w-full items-center gap-3 rounded-md border-l-2 border-transparent px-4 py-2.5 text-left text-sm text-gray-400 transition-all duration-200 hover:border-red-500 hover:bg-red-500/10 hover:text-white'
                >
                  <SignOut size={18} />
                  <span>Logout</span>
                </motion.button>
              </motion.nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function renderNavIcon(icon: JSX.Element, isActive: boolean) {
  if (!isValidElement(icon)) return icon
  return cloneElement(icon, {
    className: isActive ? 'text-purple-400' : 'text-gray-500',
    weight: isActive ? 'fill' : 'regular',
  } as Partial<{ className: string; weight: string }>)
}

function SidebarItem({
  item,
  pathname,
  open,
  setOpen,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  open: boolean
  setOpen: (next: boolean) => void
  onNavigate: (path: string) => void
}) {
  const isPathActive = (
    path?: string,
    activePaths?: string[],
    activeExactPaths?: string[]
  ) => {
    if (activeExactPaths && activeExactPaths.length > 0) {
      const exactMatch = activeExactPaths.some((candidate) => pathname === candidate)
      if (exactMatch) {
        return true
      }
    }

    if (activePaths && activePaths.length > 0) {
      return activePaths.some((prefix) => pathname.startsWith(prefix))
    }

    const prefixes = [path, ...(activePaths || [])].filter(Boolean) as string[]
    return prefixes.some((prefix) => pathname.startsWith(prefix))
  }

  if (item.children?.length) {
    return (
      <div className='rounded-md'>
        <button
          onClick={() => setOpen(!open)}
          className='flex w-full items-center justify-between rounded-md px-4 py-2.5 text-left text-sm text-gray-400 transition-all duration-200 hover:bg-white/5 hover:text-white'
        >
          <motion.span
            className='inline-flex items-center gap-2'
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {item.icon}
            {item.label}
          </motion.span>
          <CaretDown
            size={14}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className='space-y-1 pl-2 pr-0.5 pb-1 pt-1'>
            {item.children.map((child) => {
              const isActive = isPathActive(
                child.path,
                child.activeMatchPaths ?? child.activePaths,
                child.activeExactPaths
              )
              return (
                <button
                  key={child.label}
                  onClick={() => child.path && onNavigate(child.path)}
                  className={`flex w-full items-center gap-2 rounded-md border-l-2 px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                    isActive
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {renderNavIcon(child.icon, isActive)}
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {child.label}
                  </motion.span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const isActive = isPathActive(
    item.path,
    item.activeMatchPaths ?? item.activePaths,
    item.activeExactPaths
  )
  return (
    <button
      onClick={() => item.path && onNavigate(item.path)}
      className={`flex w-full items-center gap-3 rounded-md border-l-2 px-4 py-2.5 text-left text-sm transition-all duration-200 ${
        isActive
          ? 'border-purple-500 bg-purple-500/10 text-white'
          : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {renderNavIcon(item.icon, isActive)}
      <motion.span
        whileHover={{ x: 3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {item.label}
      </motion.span>
    </button>
  )
}
