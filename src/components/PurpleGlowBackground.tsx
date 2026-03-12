import type { CSSProperties } from 'react'

type BlobConfig = {
  top?: string
  right?: string
  bottom?: string
  left?: string
  size?: number
  color?: string
  opacity?: number
  blur?: number
}

interface PurpleGlowBackgroundProps {
  baseColor?: string
  noiseOpacity?: number
  gridOpacity?: number
  blurIntensity?: number
  mobileScale?: number
  animate?: boolean
  animationDuration?: number
  blobs?: BlobConfig[]
}

const DEFAULT_BLOBS: BlobConfig[] = [
  { top: '-280px', left: '-220px', size: 920, color: '#A855F7', opacity: 0.1, blur: 132 },
  { top: '-180px', right: '-260px', size: 840, color: '#9333EA', opacity: 0.09, blur: 122 },
  { bottom: '-320px', left: '18%', size: 980, color: '#A855F7', opacity: 0.08, blur: 138 },
  { bottom: '-260px', right: '-220px', size: 780, color: '#9333EA', opacity: 0.08, blur: 118 },
]

export function PurpleGlowBackground({
  baseColor = '#060608',
  noiseOpacity = 0.035,
  gridOpacity = 0.04,
  blurIntensity = 1,
  mobileScale = 0.68,
  animate = false,
  animationDuration = 10,
  blobs = DEFAULT_BLOBS,
}: PurpleGlowBackgroundProps) {
  return (
    <div
      className='pointer-events-none fixed inset-0 z-0 overflow-hidden'
      style={{ backgroundColor: baseColor }}
      aria-hidden='true'
    >
      <div
        className='absolute inset-0'
        style={
          {
            opacity: noiseOpacity,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='4' cy='6' r='1'/%3E%3Ccircle cx='36' cy='22' r='1'/%3E%3Ccircle cx='74' cy='18' r='1'/%3E%3Ccircle cx='116' cy='10' r='1'/%3E%3Ccircle cx='20' cy='52' r='1'/%3E%3Ccircle cx='64' cy='58' r='1'/%3E%3Ccircle cx='96' cy='38' r='1'/%3E%3Ccircle cx='126' cy='52' r='1'/%3E%3Ccircle cx='10' cy='96' r='1'/%3E%3Ccircle cx='46' cy='112' r='1'/%3E%3Ccircle cx='90' cy='102' r='1'/%3E%3Ccircle cx='130' cy='118' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
          } as CSSProperties
        }
      />

      <div
        className='absolute inset-0'
        style={{
          opacity: gridOpacity,
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.24) 0.8px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage:
            'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)',
        }}
      />

      {blobs.map((blob, index) => {
        const desktopSize = blob.size ?? 860
        const mobileSize = Math.round(desktopSize * mobileScale)
        const desktopBlur = Math.round((blob.blur ?? 120) * blurIntensity)
        const mobileBlur = Math.round(desktopBlur * mobileScale)
        const animation = animate
          ? `purpleGlowFloat ${animationDuration + index * 0.9}s ease-in-out infinite`
          : undefined

        return (
          <div
            key={`purple-glow-blob-${index}`}
            className='purple-glow-blob absolute rounded-[9999px]'
            style={
              {
                top: blob.top,
                right: blob.right,
                bottom: blob.bottom,
                left: blob.left,
                backgroundColor: blob.color ?? '#8B5CF6',
                opacity: blob.opacity ?? 0.06,
                width: `${desktopSize}px`,
                height: `${desktopSize}px`,
                filter: `blur(${desktopBlur}px)`,
                transform: 'translateZ(0)',
                animation,
                '--blob-mobile-size': `${mobileSize}px`,
                '--blob-mobile-blur': `${mobileBlur}px`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
