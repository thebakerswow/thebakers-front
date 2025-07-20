import { useMemo } from 'react'

export interface Color {
  name: string
  code: string
}

export const getTextColorForBackground = (backgroundColor: string): string => {
  const color = backgroundColor.substring(1)
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > 186 ? 'black' : 'white'
}

import { ColorSelectorProps } from '../types'

export function ColorSelector({ onSelectColor }: ColorSelectorProps) {
  const backgroundColors: Color[] = useMemo(
    () => [
      { name: 'Druid', code: '#FF7D0A' },
      { name: 'Hunter', code: '#ABD473' },
      { name: 'Mage', code: '#69CCF0' },
      { name: 'Paladin', code: '#F58CBA' },
      { name: 'Priest', code: '#FFFFFF' },
      { name: 'Rogue', code: '#FFF569' },
      { name: 'Shaman', code: '#0070DE' },
      { name: 'Warlock', code: '#9482C9' },
      { name: 'Demon Hunter', code: '#A330C9' },
      { name: 'Warrior', code: '#C79C6E' },
      { name: 'Evoker', code: '#33937F' },
      { name: 'Death Knight', code: '#C41E3A' },
      { name: 'Monk', code: '#00FF98' },
    ],
    []
  )

  return (
    <div className='grid grid-cols-2 gap-2'>
      {backgroundColors.map((color) => (
        <div
          key={color.code}
          className='cursor-pointer rounded p-2 text-sm'
          style={{
            backgroundColor: color.code,
            color: getTextColorForBackground(color.code),
          }}
          onClick={() => onSelectColor(color.code)}
        >
          {color.name}
        </div>
      ))}
    </div>
  )
}
