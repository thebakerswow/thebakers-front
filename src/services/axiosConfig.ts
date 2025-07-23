import axios from 'axios'

// Instância para chamadas autenticadas (requisições que precisam de token)
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
    APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
  },
})

// Interceptor para adicionar automaticamente o token nas requisições autenticadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt') // Obtém o token da sessão
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de resposta, especialmente erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Verifica se é um erro de autenticação (401) ou erro de token inválido
    if (error.response?.status === 401) {
      // Remove o token do localStorage
      localStorage.removeItem('jwt')

      // Se não estiver na página de login, redireciona para login
      if (
        window.location.pathname !== '/' &&
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/'
      }
    }

    return Promise.reject(error)
  }
)
