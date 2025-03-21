import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import somethingWrong from '../../../assets/something-wrong.png'

export function LoginErro() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className='flex flex-col items-center py-20 text-center'>
      <h1 className='text-4xl font-bold'>Oops, something went wrong!</h1>
      <Link
        className='mt-4 rounded-md bg-red-500 p-2 text-white transition-all hover:bg-red-600'
        to={'/'}
      >
        Return to login
      </Link>
      <img src={somethingWrong} className='mt-4 w-[1000px]' />
    </div>
  )
}
