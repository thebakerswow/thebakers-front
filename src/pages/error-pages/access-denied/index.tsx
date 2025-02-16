import accessDenied from '../../../assets/access-denied.png'

export function AccessDenied() {
  return (
    <div className=' flex items-center flex-col text-center py-20'>
      <h1 className='text-4xl font-bold'>Access Denied</h1>
      <p className='mt-4'>Get out fucking Bear</p>
      <img src={accessDenied} className='w-[1000px] mt-4' />
    </div>
  )
}
