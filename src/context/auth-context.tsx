import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react'

type AuthContextType = {
  isAuthenticated: boolean
  loading: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const user = sessionStorage.getItem('jwt') // Exemplo de verificação de autenticação
    if (user) {
      setIsAuthenticated(true)
    }
    setLoading(false) // Após carregar o estado de autenticação, desativa o loading
  }, [])

  const login = (token: string) => {
    setIsAuthenticated(true)
    sessionStorage.setItem('jwt', token)
  }

  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('jwt')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
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
