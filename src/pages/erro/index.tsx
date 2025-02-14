import erroImage from '../../assets/erro-image.png'

export function ErrorPage() {
  return (
    <div className=' flex items-center flex-col text-center py-20'>
      <h1 className='text-4xl font-bold'>Erro - Página Não Encontrada</h1>
      <p className='mt-4'>
        A página que você procurou não existe ou ocorreu um erro.
      </p>
      <img src={erroImage} className='w-96 mt-4' alt='' />
    </div>
  )
}
