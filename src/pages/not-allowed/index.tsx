import notAllowed from '../../assets/not-allowed.png'

export function NotAllowed() {
  return (
    <div className=' flex items-center flex-col text-center py-20'>
      <h1 className='text-4xl font-bold'>Acesso Negado</h1>
      <p className='mt-4'>Cai fora urso vagabundo</p>
      <img src={notAllowed} className='w-96 mt-4' />
    </div>
  )
}
