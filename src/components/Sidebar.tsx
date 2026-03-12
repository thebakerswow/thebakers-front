import { cloneElement, isValidElement, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowFatUp,
  Briefcase,
  CalendarBlank,
  CaretDown,
  Coins,
  CurrencyDollar,
  Key,
  List as ListIcon,
  List,
  SignOut,
  Sword,
  Trophy,
  User,
  X,
  ClipboardText,
} from '@phosphor-icons/react'
import { useAuth } from '../context/auth-context'
import { shouldShowBookingsTab, shouldUseNewBalance } from '../utils/role-utils'

type NavItem = {
  label: string
  path?: string
  activePaths?: string[]
  activeMatchPaths?: string[]
  activeExactPaths?: string[]
  icon: JSX.Element
  children?: NavItem[]
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, isAuthenticated, userRoles } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    finances: true,
    bookings: true,
    management: true,
  })

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
    setIsMobileOpen(false)
  }

  const goTo = (path: string) => {
    navigate(path)
    setIsMobileOpen(false)
  }

  const navItems: NavItem[] = [
    { label: 'Home', path: '/home', icon: <Briefcase size={18} /> },
    {
      label: 'Finances',
      icon: <CurrencyDollar size={18} />,
      children: [
        { label: 'Balance', path: '/balance', icon: <Coins size={18} /> },
        { label: 'Sells', path: '/sells', icon: <CurrencyDollar size={18} /> },
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
    ...(hasAccess([import.meta.env.VITE_TEAM_MPLUS]) &&
    !hasAccess([import.meta.env.VITE_TEAM_CHEFE])
      ? [
          {
            label: 'Services',
            path: '/services',
            icon: <CalendarBlank size={18} />,
          },
        ]
      : []),
    ...(shouldShowBookingsTab(userRoles)
      ? [
          {
            label: 'Bookings (NA)',
            icon: <CalendarBlank size={18} />,
            children: [
              {
                label: 'Raids',
                path: '/bookings-na/raids',
                activeExactPaths: ['/bookings-na/raids'],
                activeMatchPaths: ['/bookings-na/run'],
                activePaths: ['/bookings-na/run'],
                icon: <ListIcon size={18} />,
              },
              {
                label: 'Keys',
                path: '/keys',
                activeExactPaths: ['/keys'],
                activeMatchPaths: ['/keys', '/bookings-na/key'],
                activePaths: ['/bookings-na/key'],
                icon: <Key size={18} />,
              },
              {
                label: 'Leveling',
                path: '/leveling',
                activeExactPaths: ['/leveling'],
                activeMatchPaths: ['/leveling', '/bookings-na/leveling'],
                activePaths: ['/bookings-na/leveling'],
                icon: <ArrowFatUp size={18} />,
              },
              {
                label: 'Delves',
                path: '/delves',
                activeExactPaths: ['/delves'],
                activeMatchPaths: ['/delves', '/bookings-na/delves'],
                activePaths: ['/bookings-na/delves'],
                icon: <Sword size={18} />,
              },
              {
                label: 'Achievements',
                path: '/achievements',
                activeExactPaths: ['/achievements'],
                activeMatchPaths: ['/achievements', '/bookings-na/achievements'],
                activePaths: ['/bookings-na/achievements'],
                icon: <Trophy size={18} />,
              },
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

      <aside className='relative z-20 hidden w-64 shrink-0 border-r border-white/5 bg-[#0a0a0c] backdrop-blur-sm md:flex md:flex-col'>
        <div className='md:sticky md:top-0 md:flex md:h-screen md:flex-col'>
          <div className='flex h-full flex-col overflow-hidden'>
            <div className='relative flex shrink-0 items-center justify-center border-b border-white/5 px-6 py-8'>
              <button
                onClick={() => goTo('/home')}
                className='inline-flex items-center justify-center gap-2 text-xl font-semibold uppercase tracking-[0.32em] text-white'
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
              >
                <span>THE</span>
                <span className='text-[10px] text-purple-500'>●</span>
                <span>BAKERS</span>
              </button>
            </div>
            <div className='flex shrink-0 items-center justify-center px-6 py-3'>
              <p className='text-base text-gray-400'>Administration</p>
            </div>
            <nav className='font-space-grotesk min-h-0 flex-1 overflow-y-auto space-y-1 px-4 py-2'>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  pathname={location.pathname}
                  open={openGroups[item.label.toLowerCase()] ?? true}
                  setOpen={(next) =>
                    setOpenGroups((prev) => ({ ...prev, [item.label.toLowerCase()]: next }))
                  }
                  onNavigate={goTo}
                />
              ))}
            </nav>
          </div>
        </div>
        <div className='mt-auto shrink-0 border-t border-white/5 px-4 py-4'>
          <button
            onClick={handleLogout}
            className='flex w-full items-center gap-3 rounded-md border-l-2 border-transparent px-4 py-2.5 text-gray-400 transition-all duration-200 hover:border-red-500 hover:bg-red-500/10 hover:text-white'
          >
            <SignOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          <button
            className='absolute inset-0 bg-black/60'
            onClick={() => setIsMobileOpen(false)}
            aria-label='Close sidebar backdrop'
          />
          <aside className='absolute left-0 top-0 flex h-full w-[82%] max-w-[320px] flex-col border-r border-white/5 bg-[#0a0a0c]/95 p-4 backdrop-blur-sm'>
            <div className='mb-4 flex items-center justify-between'>
              <button
                onClick={() => goTo('/home')}
                className='inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-white'
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
              >
                <span>THE</span>
                <span className='text-[10px] text-purple-500'>●</span>
                <span>BAKERS</span>
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className='rounded-md border border-white/10 bg-white/5 p-2 text-white transition hover:border-purple-500/40 hover:text-purple-300'
              >
                <X size={18} />
              </button>
            </div>

            <nav className='font-space-grotesk flex-1 space-y-1 overflow-y-auto'>
              {navItems.map((item) => (
                <SidebarItem
                  key={`mobile-${item.label}`}
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
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className='mt-4 flex w-full shrink-0 items-center gap-3 rounded-md border-l-2 border-transparent px-4 py-2.5 text-gray-400 transition-all duration-200 hover:border-red-500 hover:bg-red-500/10 hover:text-white'
            >
              <SignOut size={18} />
              Logout
            </button>
          </aside>
        </div>
      )}
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
          <span className='inline-flex items-center gap-2'>
            {item.icon}
            {item.label}
          </span>
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
                  {child.label}
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
      {item.label}
    </button>
  )
}
