const SOFTWARE_RENDERER_HINTS = [
  'swiftshader',
  'software',
  'llvmpipe',
  'softpipe',
  'microsoft basic render',
]

let softwareRenderingCache: boolean | null = null

const hasSoftwareRendererHint = (rendererInfo: string) =>
  SOFTWARE_RENDERER_HINTS.some((hint) => rendererInfo.includes(hint))

export const isSoftwareRenderingLikely = () => {
  if (softwareRenderingCache !== null) return softwareRenderingCache

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    softwareRenderingCache = false
    return softwareRenderingCache
  }

  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('webgl2')

    if (!gl || !('getParameter' in gl)) {
      softwareRenderingCache = false
      return softwareRenderingCache
    }

    const debugRendererInfo = (gl as WebGLRenderingContext).getExtension(
      'WEBGL_debug_renderer_info'
    )

    if (!debugRendererInfo) {
      softwareRenderingCache = false
      return softwareRenderingCache
    }

    const renderer = (gl as WebGLRenderingContext)
      .getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL)
      ?.toString()
      .toLowerCase()

    softwareRenderingCache = renderer ? hasSoftwareRendererHint(renderer) : false
    return softwareRenderingCache
  } catch {
    softwareRenderingCache = false
    return softwareRenderingCache
  }
}
