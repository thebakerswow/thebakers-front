import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { login } = useAuth() // Acessa a função de login do AuthContext

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      login(token) // Agora o login aceita o token como argumento
      setIsAuthenticated(true) // Força a re-renderização
    } else {
      console.error('Token não encontrado na URL.')
    }
  }, [searchParams, login])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home') // Redireciona para /home após o login
    }
  }, [isAuthenticated, navigate])

  return <p>Autenticando...</p>
}
