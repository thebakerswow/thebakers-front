import erroImage from '../../../assets/erro-image.png'

export function ErrorPage() {
  return (
    <div className='flex flex-col items-center py-20 text-center'>
      <h1 className='text-4xl font-bold text-red-500'>
        Error - Page Not Found
      </h1>
      <p className='mt-4 text-red-500'>
        The page you were looking for does not exist or an error occurred.
      </p>
      <img src={erroImage} className='mt-4 w-[1000px]' />
    </div>
  )
}
