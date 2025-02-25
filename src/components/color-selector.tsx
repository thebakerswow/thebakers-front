export interface Color {
  name: string
  code: string
}

const backgroundColors: Color[] = [
  { name: 'Druid', code: '#FF7D0A' },
  { name: 'Hunter', code: '#ABD473' },
  { name: 'Mage', code: '#69CCF0' },
  { name: 'Paladin', code: '#F58CBA' },
  { name: 'Priest', code: '#FFFFFF' },
  { name: 'Rogue', code: '#FFF569' },
  { name: 'Shaman', code: '#0070DE' },
  { name: 'Warlock', code: '#9482C9' },
  { name: 'Warrior', code: '#C79C6E' },
  { name: 'Evoker', code: '#33937F' },
  { name: 'Death Knight', code: '#C41E3A' },
  { name: 'Monk', code: '#00FF98' },
]

export const getTextColorForBackground = (backgroundColor: string): string => {
  const color = backgroundColor.substring(1)
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > 186 ? 'black' : 'white'
}

interface ColorSelectorProps {
  onSelectColor: (color: string) => void
}

export function ColorSelector({ onSelectColor }: ColorSelectorProps) {
  return (
    <div className='grid grid-cols-2 gap-2'>
      {backgroundColors.map((color) => (
        <div
          key={color.code}
          className='p-2 rounded cursor-pointer text-sm'
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
