import { useEffect } from 'react'
import neymar from '../../../assets/neymar.png'

export function CheckAccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = 'https://www.youtube.com/shorts/IxJzvkU2kfk'
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className='flex flex-col items-center py-10 text-center'>
      <h1 className='text-4xl font-bold text-red-500'>Access Denied</h1>
      <p className='mt-4 text-red-500'>kkkkkk</p>
      <img src={neymar} className='mt-4 h-[700px] w-[800px]' />
    </div>
  )
}
