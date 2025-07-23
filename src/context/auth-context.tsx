import { jwtDecode } from 'jwt-decode'
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react'

interface JwtPayload {
  roles?: string[]
  role?: string
  roles_array?: string[]
  exp?: number
  user_id?: string
  userId?: string
  id?: string
  sub?: string
}

type AuthContextType = {
  isAuthenticated: boolean
  loading: boolean
  login: (token: string) => void
  logout: () => void
  userRoles: string[]
  isPermissionAuthenticated: boolean
  idDiscord: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [idDiscord, setIdDiscord] = useState<string | null>(null)

  const checkAuth = () => {
    const token = localStorage.getItem('jwt')
    setLoading(true)

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)

        // Verifica se o token expirou
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          console.log('Token expired, logging out')
          logout()
          setLoading(false)
          return
        }

        const roles = decoded.roles || decoded.role || decoded.roles_array
        const userId =
          decoded.user_id || decoded.userId || decoded.id || decoded.sub

        const finalRoles = roles
          ? Array.isArray(roles)
            ? roles.map((r) => r.toString())
            : [roles.toString()]
          : ['user']
        const finalUserId = userId ? userId.toString() : 'unknown'

        setUserRoles(finalRoles)
        setIdDiscord(finalUserId)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Erro ao decodificar token:', error)
        logout()
      }
    } else {
      logout()
    }

    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const login = (token: string) => {
    localStorage.setItem('jwt', token)
    checkAuth()
  }

  const logout = () => {
    localStorage.removeItem('jwt')
    setUserRoles([])
    setIdDiscord(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout,
        userRoles,
        isPermissionAuthenticated: userRoles.length > 0,
        idDiscord,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
