import axios from 'axios'

// Instância para chamadas autenticadas (requisições que precisam de token)
export const api = axios.create({
  //baseURL: `${import.meta.env.VITE_API_BASE_URL}/v1`
  baseURL: 'https://thebakers-backend.fly.dev/v1',
  headers: {
    'Content-Type': 'application/json',
    APP_TOKEN: 'kcJwz9dzgC2Gb0axp',
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
