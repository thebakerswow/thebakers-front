import { jwtDecode } from 'jwt-decode'
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react'

interface JwtPayload {
  roles: string[] // Definido como obrigatório conforme sua necessidade
}

type AuthContextType = {
  isAuthenticated: boolean
  loading: boolean
  login: (token: string) => void
  logout: () => void
  userRoles: string[]
  isPermissionAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true) // Mantemos o estado de loading
  const [userRoles, setUserRoles] = useState<string[]>([])

  const checkAuth = () => {
    const token = localStorage.getItem('jwt')
    setLoading(true) // Inicia o loading
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        setUserRoles(decoded.roles.map((r) => r.toString()))
        setIsAuthenticated(true)
      } catch (error) {
        setUserRoles([])
        setIsAuthenticated(false)
      }
    } else {
      setUserRoles([])
      setIsAuthenticated(false)
    }
    setLoading(false) // Finaliza o loading após verificação
  }

  useEffect(() => {
    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const login = (token: string) => {
    localStorage.setItem('jwt', token)
    checkAuth() // Atualiza o estado após login
  }

  const logout = () => {
    localStorage.removeItem('jwt')
    setUserRoles([])
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
