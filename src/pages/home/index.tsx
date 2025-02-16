import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

type DiscordTokenPayload = {
  username: string
  discriminator: string
  avatar: string
  roles: string
  id: string
}

export function HomePage() {
  const [username, setUsername] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('jwt')
    if (!token) return

    try {
      const decoded = jwtDecode<DiscordTokenPayload>(token)
      setUsername(decoded.username)
    } catch (error) {
      console.error('Erro ao decodificar o token:', error)
    }
  }, [])

  return (
    <div className='bg-zinc-700 text-gray-100 p-4 h-[400px] w-[800px] text-4xl flex flex-col items-center justify-center font-semibold rounded-xl shadow-2xl mt-20'>
      <div>
        Welcome to TheBakers <span className='text-red-700 font-bold'>Hub</span>
      </div>

      {username && (
        <div className='text-2xl mt-4'>
          Olá, <span className='text-red-500'>{username}</span>!
        </div>
      )}
    </div>
  )
}
