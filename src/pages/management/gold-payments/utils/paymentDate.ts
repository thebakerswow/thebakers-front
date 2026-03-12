interface PaymentDateLike {
  id: string | number
  name: string
}

export const toMonthDay = (dateValue: string): string => {
  if (!dateValue) return dateValue

  const trimmedDate = dateValue.trim()
  const yyyyMmDdMatch = trimmedDate.match(/^\d{4}-(\d{1,2})-(\d{1,2})$/)
  if (yyyyMmDdMatch) {
    const month = Number(yyyyMmDdMatch[1])
    const day = Number(yyyyMmDdMatch[2])
    return `${month}/${day}`
  }

  const mmDdMatch = trimmedDate.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (mmDdMatch) {
    const month = Number(mmDdMatch[1])
    const day = Number(mmDdMatch[2])
    return `${month}/${day}`
  }

  return trimmedDate
}

export const getMonthDaySortValue = (dateValue: string): number => {
  const normalizedDate = toMonthDay(dateValue)
  const match = normalizedDate.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!match) return 0
  return Number(match[1]) * 100 + Number(match[2])
}

export const sortPaymentDatesByName = <T extends PaymentDateLike>(dates: T[]): T[] => {
  return [...dates].sort((dateA, dateB) => {
    const dateValueA = getMonthDaySortValue(dateA.name)
    const dateValueB = getMonthDaySortValue(dateB.name)

    if (dateValueA && dateValueB) {
      return dateValueA - dateValueB
    }

    const idA = Number(dateA.id)
    const idB = Number(dateB.id)

    if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
      return idA - idB
    }

    return dateA.name.localeCompare(dateB.name)
  })
}
