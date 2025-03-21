import accessDenied from '../../../assets/access-denied.png'

export function AccessDenied() {
  return (
    <div className='flex flex-col items-center py-20 text-center'>
      <h1 className='text-4xl font-bold'>Access Denied</h1>
      <p className='mt-4'>Get out fucking Bear</p>
      <img src={accessDenied} className='mt-4 w-[1000px]' />
    </div>
  )
}
