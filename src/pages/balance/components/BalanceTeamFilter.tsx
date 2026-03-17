import { useEffect, useMemo, useState, useCallback } from 'react'
import { fetchBalanceTeams } from '../services/balanceApi'
import { useAuth } from '../../../context/AuthContext'
import { shouldShowBalanceFilter, getUserTeamsForFilter } from '../../../utils/roleUtils'
import { CustomSelect } from '../../../components/CustomSelect'
import { handleApiError } from '../../../utils/apiErrorHandler'
import { BalanceTeamFilterProps, BalanceTeamOption } from '../types/balance'

// Função para ordenar times por prioridade baseada nos nomes
const sortTeamsByPriority = (
  teams: BalanceTeamOption[]
) => {
  // Define a ordem de prioridade dos times
  const priorityOrder = [
    'Chefe de cozinha',
    'M+',
    'Leveling',
    'Garçom',
    'Confeiteiros',
    'Jackfruit',
    'Insanos',
    'APAE',
    'Los Renegados',
    'DTM',
    'KFFC',
    'Greensky',
    'Guild Azralon BR#1',
    'Guild Azralon BR#2',
    'Rocket',
    'Punks',
    'Padeirinho',
    'Milharal',
    'Bastard Munchen',
  ]

  return teams.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.team_name)
    const bIndex = priorityOrder.indexOf(b.team_name)

    // Se ambos estão na lista de prioridade, ordena pela posição
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }

    // Se apenas um está na lista de prioridade, ele vem primeiro
    if (aIndex !== -1 && bIndex === -1) {
      return -1
    }
    if (aIndex === -1 && bIndex !== -1) {
      return 1
    }

    // Se nenhum está na lista de prioridade, ordena alfabeticamente
    return a.team_name.localeCompare(b.team_name)
  })
}

export function BalanceTeamFilter({
  selectedTeam,
  onChange,
}: BalanceTeamFilterProps) {
  const { userRoles } = useAuth()
  
  // Determina se deve mostrar o filtro baseado nas regras especificadas
  const shouldShowFilter = useMemo(() => shouldShowBalanceFilter(userRoles), [userRoles])
  
  // Obtém os times que o usuário deve ver no filtro
  const userTeams = useMemo(() => getUserTeamsForFilter(userRoles), [userRoles])

  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)
  const [teams, setTeams] = useState<BalanceTeamOption[]>([])

  const fetchTeams = useCallback(async () => {
    if (isLoadingTeams) return // Evita chamadas duplicadas
    
    setIsLoadingTeams(true)
    setHasAttemptedFetch(true)
    try {
      const response = await fetchBalanceTeams()

      // Se o usuário tem cargo de Chefe de cozinha, mostra todos os times
      // Caso contrário, filtra apenas os times que o usuário deve ver
      const isChefe = userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)
      let filteredTeams = response

      if (!isChefe) {
        const userTeamsSet = new Set(userTeams)
        filteredTeams = response.filter((team) =>
          userTeamsSet.has(team.id_discord)
        )
      }

      const uniqueTeams = filteredTeams.reduce<BalanceTeamOption[]>(
        (acc, team) =>
          acc.some((t) => t.team_name === team.team_name)
            ? acc
            : [...acc, team],
        []
      )

      // Aplica a ordenação por prioridade
      const sortedTeams = sortTeamsByPriority(uniqueTeams)
      setTeams(sortedTeams)
    } catch (error) {
      await handleApiError(error, 'Failed to fetch balance teams')
    } finally {
      setIsLoadingTeams(false)
    }
  }, [userTeams, userRoles, isLoadingTeams])

  useEffect(() => {
    // Só busca teams se deve mostrar o filtro e se ainda não carregou
    // Para Chefe de cozinha, sempre busca (não depende de userTeams.length)
    const isChefe = userRoles.includes(import.meta.env.VITE_TEAM_CHEFE)
    const shouldFetch =
      shouldShowFilter &&
      teams.length === 0 &&
      !isLoadingTeams &&
      !hasAttemptedFetch &&
      (isChefe || userTeams.length > 0)
    
    if (shouldFetch) {
      void fetchTeams()
    }
  }, [
    shouldShowFilter,
    teams.length,
    isLoadingTeams,
    hasAttemptedFetch,
    userTeams.length,
    userRoles,
    fetchTeams,
  ])

  // Memoriza as opções para evitar renderizações desnecessárias quando a lista de times não muda
  const customSelectOptions = useMemo(
    () => teams.map((team) => ({ value: team.id_discord, label: team.team_name })),
    [teams]
  )

  // Define o time inicial apenas para usuários que devem ver o filtro quando teams são carregados
  useEffect(() => {
    if (
      shouldShowFilter &&
      !selectedTeam &&
      teams.length > 0 &&
      !isLoadingTeams
    ) {
      const initialTeam = teams[0].id_discord
      onChange(initialTeam)
    }
  }, [shouldShowFilter, selectedTeam, teams.length, isLoadingTeams, onChange])

  // Para usuários que não devem ver o filtro, não mostra o componente
  if (!shouldShowFilter) {
    return null
  }

  return (
    <div className='relative mt-4'>
      <CustomSelect
        value={selectedTeam || ''}
        options={customSelectOptions}
        onChange={(value) => onChange(value || null)}
        disabled={isLoadingTeams}
        placeholder={isLoadingTeams ? 'Loading teams...' : 'No teams available'}
        minWidthClassName='min-w-[220px]'
      />
    </div>
  )
}
