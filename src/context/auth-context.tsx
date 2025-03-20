import { jwtDecode } from 'jwt-decode'
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react'

interface JwtPayload {
  roles: string[]
  exp: number // Adiciona a expiração do token
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
  const [loading, setLoading] = useState<boolean>(true)
  const [userRoles, setUserRoles] = useState<string[]>([])

  const checkAuth = () => {
    const token = localStorage.getItem('jwt')
    setLoading(true)

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)

        // Verifica se o token expirou
        const now = Date.now() / 1000 // Tempo atual em segundos
        if (decoded.exp < now) {
          console.log('Token expirado, realizando logout.')
          logout()
          return
        }

        setUserRoles(decoded.roles.map((r) => r.toString()))
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
