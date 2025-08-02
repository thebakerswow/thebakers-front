import { ReactNode } from 'react'
import { ExternalHomePage } from '../pages/external/home'

interface DomainRouterProps {
  children: ReactNode
}

// Verifica se está no domínio externo (vitrine)
const isExternalDomain = () => {
  const currentHost = window.location.hostname
  const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || 'localhost'

  // Remove 'www.' de ambos os hostnames para comparação
  const normalizedCurrentHost = currentHost.replace(/^www\./, '')
  const normalizedMainDomain = mainDomain.replace(/^www\./, '')

  return (
    normalizedCurrentHost !== normalizedMainDomain &&
    normalizedCurrentHost !== 'localhost'
  )
}

export function DomainRouter({ children }: DomainRouterProps) {
  const isExternal = isExternalDomain()

  // Se está no domínio externo, renderiza as páginas externas
  if (isExternal) {
    return <ExternalHomePage />
  }

  // Se está no domínio principal, renderiza as páginas normais
  return <>{children}</>
}
