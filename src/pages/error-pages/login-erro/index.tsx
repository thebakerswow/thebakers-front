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
    <div className='flex items-center flex-col text-center py-20'>
      <h1 className='text-4xl font-bold'>Oops, something went wrong!</h1>
      <Link
        className='mt-4 bg-red-500 hover:bg-red-600 transition-all  p-2 rounded-md text-white'
        to={'/'}
      >
        Return to login
      </Link>
      <img src={somethingWrong} className='w-[1000px] mt-4' />
    </div>
  )
}
