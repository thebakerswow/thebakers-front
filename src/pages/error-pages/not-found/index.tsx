import erroImage from '../../../assets/erro-image.png'

export function ErrorPage() {
  return (
    <div className=' flex items-center flex-col text-center py-20'>
      <h1 className='text-4xl font-bold'>Error - Page Not Found</h1>
      <p className='mt-4'>
        The page you were looking for does not exist or an error occurred.
      </p>
      <img src={erroImage} className='w-[1000px] mt-4' />
    </div>
  )
}
