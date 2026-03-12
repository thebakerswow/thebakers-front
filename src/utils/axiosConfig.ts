import axios from 'axios'

// Instance for authenticated calls (requests that need token)
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
    APP_TOKEN: import.meta.env.VITE_APP_TOKEN,
  },
})

// Interceptor to automatically add token to authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt') // Gets token from session
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor to handle response errors, especially authentication errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Checks if it's an authentication error (401) or invalid token error
    // Excludes invalid credentials errors (wrong password during login)
    if (error.response?.status === 401) {
      const errorData = error.response?.data?.errors?.[0]
      const isInvalidCredentials =
        errorData?.title === 'Invalid Password' ||
        errorData?.title === 'Invalid password' ||
        errorData?.detail === 'Invalid password'

      // Only logout and redirect if it's not an invalid credentials error
      if (!isInvalidCredentials) {
        // Remove o token do localStorage
        localStorage.removeItem('jwt')

        // If not on login page, redirect to login
        if (
          window.location.pathname !== '/' &&
          window.location.pathname !== '/login'
        ) {
          window.location.href = '/'
        }
      }
    }

    return Promise.reject(error)
  }
)
