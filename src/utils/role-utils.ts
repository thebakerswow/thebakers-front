// Função para verificar se o usuário tem cargos de times que vêm no filtro
export const hasTeamRoles = (userRoles: string[]): boolean => {
  const teamRoles = [
    import.meta.env.VITE_TEAM_CHEFE,
    import.meta.env.VITE_TEAM_MPLUS,
    import.meta.env.VITE_TEAM_LEVELING,
    import.meta.env.VITE_TEAM_GARCOM,
    import.meta.env.VITE_TEAM_CONFEITEIROS,
    import.meta.env.VITE_TEAM_JACKFRUIT,
    import.meta.env.VITE_TEAM_INSANOS,
    import.meta.env.VITE_TEAM_APAE,
    import.meta.env.VITE_TEAM_LOSRENEGADOS,
    import.meta.env.VITE_TEAM_DTM,
    import.meta.env.VITE_TEAM_KFFC,
    import.meta.env.VITE_TEAM_GREENSKY,
    import.meta.env.VITE_TEAM_GUILD_AZRALON_1,
    import.meta.env.VITE_TEAM_GUILD_AZRALON_2,
    import.meta.env.VITE_TEAM_ROCKET,
    import.meta.env.VITE_TEAM_BOOTY_REAPER,
    import.meta.env.VITE_TEAM_PADEIRINHO,
    import.meta.env.VITE_TEAM_MILHARAL,
  ]

  return userRoles.some(role => teamRoles.includes(role))
}

// Função para verificar se o usuário tem apenas cargos restritos
export const hasOnlyRestrictedRoles = (userRoles: string[]): boolean => {
  const restrictedRoles = [
    import.meta.env.VITE_TEAM_FREELANCER,
    import.meta.env.VITE_TEAM_ADVERTISER,
  ]

  // Verifica se o usuário tem apenas cargos restritos (freelancer e/ou advertiser)
  // OU se tem cargos restritos + cargos de times não rastreados
  const hasRestrictedRole = userRoles.some(role => restrictedRoles.includes(role))
  const hasTrackedTeamRole = hasTeamRoles(userRoles)
  
  // Se tem cargo restrito mas NÃO tem cargo de time rastreado, é considerado restrito
  return hasRestrictedRole && !hasTrackedTeamRole
}

// Função para verificar se o usuário tem cargo de freelancer
export const hasFreelancerRole = (userRoles: string[]): boolean => {
  const freelancerRole = import.meta.env.VITE_TEAM_FREELANCER
  return userRoles.includes(freelancerRole)
}

// Função para verificar se o usuário é somente freelancer
export const isOnlyFreelancer = (userRoles: string[]): boolean => {
  const freelancerRole = import.meta.env.VITE_TEAM_FREELANCER

  // Verifica se o usuário tem apenas o cargo de freelancer
  return userRoles.length === 1 && userRoles.includes(freelancerRole)
}

// Função para verificar se o usuário tem cargo de advertiser
export const hasAdvertiserRole = (userRoles: string[]): boolean => {
  const advertiserRole = import.meta.env.VITE_TEAM_ADVERTISER
  return userRoles.includes(advertiserRole)
}

// Função para verificar se o usuário é somente advertiser
export const isOnlyAdvertiser = (userRoles: string[]): boolean => {
  const advertiserRole = import.meta.env.VITE_TEAM_ADVERTISER

  // Verifica se o usuário tem apenas o cargo de advertiser
  return userRoles.length === 1 && userRoles.includes(advertiserRole)
}

// Função para verificar se o usuário deve ver a home restrita (apenas freelancer e advertiser)
export const shouldShowRestrictedHome = (userRoles: string[]): boolean => {
  // Se o usuário tem apenas cargo de freelancer, deve ver a home restrita
  if (isOnlyFreelancer(userRoles)) {
    return true
  }
  
  // Se o usuário tem apenas cargo de advertiser, deve ver a home restrita
  if (isOnlyAdvertiser(userRoles)) {
    return true
  }
  
  // Se o usuário tem cargos de times rastreados, não deve ver a home restrita
  if (hasTeamRoles(userRoles)) {
    return false
  }
  
  // Para outros casos, segue a lógica original
  return hasOnlyRestrictedRoles(userRoles)
}

// Função para determinar se deve mostrar o filtro de times no balance
export const shouldShowBalanceFilter = (userRoles: string[]): boolean => {
  // Se o usuário tem apenas cargo de freelancer, não mostra o filtro
  if (isOnlyFreelancer(userRoles)) {
    return false
  }
  
  // Se o usuário tem apenas cargo de advertiser, não mostra o filtro
  if (isOnlyAdvertiser(userRoles)) {
    return false
  }
  
  // Se o usuário tem cargos de times que vêm no filtro, mostra o filtro
  if (hasTeamRoles(userRoles)) {
    return true
  }
  
  // Para outros cargos não rastreados, não mostra o filtro
  return false
}

// Função para obter os times que o usuário deve ver no filtro
export const getUserTeamsForFilter = (userRoles: string[]): string[] => {
  const teamRoles = [
    import.meta.env.VITE_TEAM_CHEFE,
    import.meta.env.VITE_TEAM_MPLUS,
    import.meta.env.VITE_TEAM_LEVELING,
    import.meta.env.VITE_TEAM_GARCOM,
    import.meta.env.VITE_TEAM_CONFEITEIROS,
    import.meta.env.VITE_TEAM_JACKFRUIT,
    import.meta.env.VITE_TEAM_INSANOS,
    import.meta.env.VITE_TEAM_APAE,
    import.meta.env.VITE_TEAM_LOSRENEGADOS,
    import.meta.env.VITE_TEAM_DTM,
    import.meta.env.VITE_TEAM_KFFC,
    import.meta.env.VITE_TEAM_GREENSKY,
    import.meta.env.VITE_TEAM_GUILD_AZRALON_1,
    import.meta.env.VITE_TEAM_GUILD_AZRALON_2,
    import.meta.env.VITE_TEAM_ROCKET,
    import.meta.env.VITE_TEAM_BOOTY_REAPER,
    import.meta.env.VITE_TEAM_PADEIRINHO,
    import.meta.env.VITE_TEAM_MILHARAL,
  ]

  // Se o usuário tem cargo de Chefe de cozinha, retorna todos os times
  if (userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)) {
    return teamRoles
  }

  // Para outros usuários, retorna apenas os cargos de times que possuem
  return userRoles.filter(role => teamRoles.includes(role))
}

// Função para determinar se deve mostrar o botão US/Gold no balance
export const shouldShowUsGoldButton = (userRoles: string[]): boolean => {
  // Usuários somente freelancer não devem ver o botão US/Gold
  if (isOnlyFreelancer(userRoles)) {
    return false
  }
  
  // Outros usuários podem ver o botão
  return true
}

// Função para determinar se deve mostrar a aba de bookings no header
export const shouldShowBookingsTab = (userRoles: string[]): boolean => {
  // Usuários com apenas cargo de freelancer não devem ver a aba de bookings
  if (isOnlyFreelancer(userRoles)) {
    return false
  }
  
  // Usuários com freelancer + cargos de times podem ver a aba de bookings
  if (hasFreelancerRole(userRoles) && hasTeamRoles(userRoles)) {
    return true
  }
  
  // Usuários com apenas freelancer + cargos não rastreados não devem ver a aba
  if (hasFreelancerRole(userRoles) && !hasTeamRoles(userRoles)) {
    return false
  }
  
  // Outros usuários podem ver a aba de bookings
  return true
}

// Função para determinar se o usuário pode ver o botão de attendance
export const canViewAttendanceButton = (userRoles: string[]): boolean => {
  // Se o usuário tem múltiplos cargos, pode ver o botão
  if (userRoles.length !== 1) {
    return true
  }
  
  // Se o usuário tem apenas cargo de freelancer, não pode ver o botão
  if (isOnlyFreelancer(userRoles)) {
    return false
  }
  
  // Outros usuários (incluindo advertiser) podem ver o botão
  return true
}
