import { format, addDays, parseISO, startOfDay } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

/**
 * Calendário e “hoje” no app usam o fuso local do dispositivo.
 * Helpers com SYSTEM_TIMEZONE servem para integrações legadas / backend; o rótulo “EST” na UI é informativo.
 */

// Referência de negócio (ex.: conversões legadas para API)
export const SYSTEM_TIMEZONE = 'America/New_York'

// Detecta o fuso horário do usuário para exibição
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Converte uma data EST para UTC para envio ao backend
export const estToUTC = (date: Date): Date => {
  return fromZonedTime(date, SYSTEM_TIMEZONE)
}

// Converte uma data UTC para EST
export const utcToEST = (utcDate: Date | string): Date => {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate
  return toZonedTime(date, SYSTEM_TIMEZONE)
}

// Converte uma data UTC para o fuso horário do usuário para exibição
export const utcToUserTimezone = (utcDate: Date | string): Date => {
  const userTz = getUserTimezone()
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate
  return toZonedTime(date, userTz)
}

// Obtém a data atual no fuso horário do usuário (instante “agora” visto nesse fuso)
export const getCurrentUserDate = (): Date => {
  return utcToUserTimezone(new Date())
}

/** Hoje no calendário local do dispositivo (yyyy-MM-dd). */
export const getLocalTodayDateString = (): string => {
  return format(startOfDay(new Date()), 'yyyy-MM-dd')
}

// Próximos 7 dias a partir de hoje no calendário local (home / schedule)
export const getWeekDates = (): string[] => {
  const today = startOfDay(new Date())
  const dates: string[] = []

  for (let i = 0; i < 7; i++) {
    dates.push(format(addDays(today, i), 'yyyy-MM-dd'))
  }

  return dates
}

// Converte uma data de input HTML (YYYY-MM-DD) de EST para UTC
export const estDateInputToUTC = (dateString: string): string => {
  // Cria uma data em EST às 00:00
  const estDate = new Date(`${dateString}T00:00:00`)
  const utcDate = estToUTC(estDate)
  return utcDate.toISOString().split('T')[0]
}

// Converte uma data UTC para formato de input HTML (YYYY-MM-DD) em EST
export const utcToESTDateInput = (utcDateString: string): string => {
  const estDate = utcToEST(utcDateString)
  return format(estDate, 'yyyy-MM-dd')
}

// Converte um horário EST para UTC considerando a data
export const estTimeToUTC = (dateString: string, timeString: string): string => {
  // Combina data e hora em EST
  const estDateTime = new Date(`${dateString}T${timeString}:00`)
  const utcDateTime = estToUTC(estDateTime)
  return utcDateTime.toISOString()
}

// Converte um datetime UTC para exibição no fuso do usuário
export const utcToUserDateTime = (utcDateTime: string): { date: string; time: string } => {
  const userDateTime = utcToUserTimezone(utcDateTime)
  
  return {
    date: format(userDateTime, 'yyyy-MM-dd'),
    time: format(userDateTime, 'HH:mm')
  }
}

// Converte um datetime UTC para exibição em EST
export const utcToESTDateTime = (utcDateTime: string): { date: string; time: string } => {
  const estDateTime = utcToEST(utcDateTime)
  
  return {
    date: format(estDateTime, 'yyyy-MM-dd'),
    time: format(estDateTime, 'HH:mm')
  }
}
