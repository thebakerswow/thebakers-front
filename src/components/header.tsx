import { useState } from 'react'
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
  User,
  UsersFour,
  X,
  ClipboardText,
} from '@phosphor-icons/react'
import { useAuth } from '../context/auth-context'
import { shouldShowBookingsTab, shouldUseNewBalance } from '../utils/role-utils'

type NavItem = {
  label: string
  path?: string
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
      ],
    },
    ...(shouldUseNewBalance(userRoles)
      ? [{ label: 'My Requests', path: '/my-requests', icon: <User size={18} /> }]
      : []),
    ...(hasAccess([import.meta.env.VITE_TEAM_CHEFE])
      ? [
          {
            label: 'Management',
            icon: <Briefcase size={18} />,
            children: [
              { label: 'Admin', path: '/admin', icon: <Briefcase size={18} /> },
              {
                label: 'Teams',
                path: '/management-teams',
                icon: <UsersFour size={18} />,
              },
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
                path: '/receipts',
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
                label: 'Full Raids',
                path: '/bookings-na',
                icon: <ListIcon size={18} />,
              },
              { label: 'Keys', path: '/keys', icon: <Key size={18} /> },
              {
                label: 'Leveling',
                path: '/leveling',
                icon: <ArrowFatUp size={18} />,
              },
              { label: 'PVP', path: '/pvp', icon: <Sword size={18} /> },
            ],
          },
        ]
      : []),
  ]

  if (!isAuthenticated) return null

  return (
    <>
      <div className='fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-xl md:hidden'>
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
            className='rounded-lg border border-white/15 p-2 text-white'
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <aside className='relative z-20 hidden w-72 shrink-0 border-r border-white/10 bg-black/70 backdrop-blur-xl md:sticky md:top-0 md:flex md:h-screen md:flex-col'>
        <div className='flex h-20 items-center justify-center border-b border-white/10 px-6'>
          <button
            onClick={() => goTo('/home')}
            className='inline-flex items-center justify-center gap-2 text-xl font-semibold uppercase tracking-[0.35em] text-white'
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <span>THE</span>
            <span className='text-[10px] text-purple-500'>●</span>
            <span>BAKERS</span>
          </button>
        </div>
        <nav className='flex-1 space-y-2 px-4 py-4'>
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
        <div className='sticky bottom-0 z-30 border-t border-white/10 bg-black/80 p-4 backdrop-blur-xl'>
          <button
            onClick={handleLogout}
            className='flex w-full items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20'
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
          <aside className='absolute left-0 top-0 h-full w-[82%] max-w-[320px] border-r border-white/10 bg-black/95 p-4'>
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
                className='rounded-lg border border-white/15 p-2 text-white'
              >
                <X size={18} />
              </button>
            </div>

            <nav className='space-y-2'>
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
              className='mt-6 flex w-full items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300'
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
  if (item.children?.length) {
    return (
      <div className='rounded-lg border border-white/5 bg-white/[0.02]'>
        <button
          onClick={() => setOpen(!open)}
          className='flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-200'
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
          <div className='space-y-1 px-2 pb-2'>
            {item.children.map((child) => {
              const isActive = child.path ? pathname.startsWith(child.path) : false
              return (
                <button
                  key={child.label}
                  onClick={() => child.path && onNavigate(child.path)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-200'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {child.icon}
                  {child.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const isActive = item.path ? pathname.startsWith(item.path) : false
  return (
    <button
      onClick={() => item.path && onNavigate(item.path)}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
        isActive
          ? 'bg-purple-500/20 text-purple-200'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {item.icon}
      {item.label}
    </button>
  )
}
