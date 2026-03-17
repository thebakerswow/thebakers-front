import { useEffect, useMemo, useRef, useState } from 'react'
import { CaretDown, X } from '@phosphor-icons/react'
import Swal from 'sweetalert2'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { COLOR_OPTIONS, DEFAULT_TEAM_COLOR, TEAM_ID_TO_COLOR_MAP, compareByPriority } from '../../../utils/teamConfig'
import { createGBank, createTransactionRequest, getUserGbanks } from '../services/balanceNewApi'
import { useAuth } from '../../../context/AuthContext'
import { handleApiError } from '../../../utils/apiErrorHandler'
import { GBank, GBankGroup, GBankListNewProps } from '../types/balanceNew'

export function GBankListNew({ selectedTeam, onInitialLoadComplete }: GBankListNewProps) {
  const { userRoles = [] } = useAuth()
  const [gbanks, setGbanks] = useState<GBank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasCompletedInitialFetch, setHasCompletedInitialFetch] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newGBankName, setNewGBankName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasReportedInitialLoad = useRef(false)
  const canCreateGBank = userRoles.includes(import.meta.env.VITE_TEAM_PREFEITO)
  const shouldShowInlineLoading = isLoading && hasReportedInitialLoad.current

  const selectedTeamLabel = useMemo(() => {
    if (!selectedTeam) return '-'
    const selectedColor = TEAM_ID_TO_COLOR_MAP[selectedTeam]
    return COLOR_OPTIONS.find((option) => option.value === selectedColor)?.label || selectedTeam
  }, [selectedTeam])

  const formatCalculatorValue = (value: string) => {
    const rawValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
    if (rawValue === '-') return '-'
    const numberValue = Number(rawValue.replace(/,/g, ''))
    if (isNaN(numberValue)) return ''
    return (Object.is(numberValue, -0) ? 0 : numberValue).toLocaleString('en-US')
  }

  const formatRoundedIntNoNegativeZero = (value: number | string) => {
    const rounded = Math.round(Number(value))
    const normalized = Object.is(rounded, -0) ? 0 : rounded
    return normalized.toLocaleString('en-US')
  }

  const showUploadModal = (gbank: GBank, value: string) => {
    let uploadedImage: string | null = null
    let fileInput: HTMLInputElement | null = null
    const convertFileToWebpDataUrl = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const source = reader.result as string
          const image = new Image()
          image.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = image.naturalWidth || image.width
            canvas.height = image.naturalHeight || image.height
            const ctx = canvas.getContext('2d')

            if (!ctx) {
              reject(new Error('Unable to process image'))
              return
            }

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
            const webpDataUrl = canvas.toDataURL('image/webp', 0.9)
            resolve(webpDataUrl)
          }
          image.onerror = () => reject(new Error('Invalid image file'))
          image.src = source
        }
        reader.onerror = () => reject(new Error('Failed to read image file'))
        reader.readAsDataURL(file)
      })

    Swal.fire({
      title: `Confirm value for ${gbank.name}`,
      html: `
        <div style="text-align:center;margin:16px 0;">
          <p style="font-size:16px;margin-bottom:16px;color:#e5e7eb;">
            Value: <strong>${value}</strong>
          </p>
          <div id="upload-area" style="
            border:1px dashed rgba(192,132,252,0.45);border-radius:10px;padding:30px 16px;margin:12px 0;
            cursor:pointer;background:rgba(255,255,255,0.03);transition:all 0.2s ease;">
            <div id="upload-content">
              <p style="margin:0;color:#d1d5db;">Click here or drag an image</p>
              <p style="margin:6px 0 0 0;font-size:12px;color:#9ca3af;">or paste with Ctrl+V</p>
            </div>
            <div id="image-preview" style="display:none;">
              <img id="preview-img" style="max-width:100%;max-height:220px;border-radius:8px;border:1px solid rgba(255,255,255,0.14);" />
              <button type="button" id="remove-image" style="
                margin-top:10px;padding:6px 12px;background:rgba(239,68,68,0.2);color:#fecaca;border:1px solid rgba(248,113,113,0.45);
                border-radius:8px;cursor:pointer;">Remove</button>
            </div>
          </div>
          <input type="file" id="file-input" accept="image/*" style="display:none;" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      didOpen: () => {
        const uploadArea = document.getElementById('upload-area')
        const uploadContent = document.getElementById('upload-content')
        const imagePreview = document.getElementById('image-preview')
        const previewImg = document.getElementById('preview-img') as HTMLImageElement
        const removeBtn = document.getElementById('remove-image')
        fileInput = document.getElementById('file-input') as HTMLInputElement
        if (!uploadArea || !uploadContent || !imagePreview || !previewImg || !removeBtn || !fileInput) return

        const processImageFile = async (file: File) => {
          if (!file.type.startsWith('image/')) {
            Swal.showValidationMessage('Please select only image files')
            return
          }
          try {
            uploadedImage = await convertFileToWebpDataUrl(file)
            previewImg.src = uploadedImage
            uploadContent.style.display = 'none'
            imagePreview.style.display = 'block'
          } catch {
            Swal.showValidationMessage('Failed to process image file')
          }
        }

        uploadArea.addEventListener('click', () => fileInput?.click())
        uploadArea.addEventListener('dragover', (e) => {
          e.preventDefault()
          uploadArea.style.borderColor = 'rgba(196,132,252,0.85)'
          uploadArea.style.background = 'rgba(168,85,247,0.18)'
        })
        uploadArea.addEventListener('dragleave', (e) => {
          e.preventDefault()
          uploadArea.style.borderColor = 'rgba(192,132,252,0.45)'
          uploadArea.style.background = 'rgba(255,255,255,0.03)'
        })
        uploadArea.addEventListener('drop', (e) => {
          e.preventDefault()
          uploadArea.style.borderColor = 'rgba(192,132,252,0.45)'
          uploadArea.style.background = 'rgba(255,255,255,0.03)'
          if (e.dataTransfer && e.dataTransfer.files.length > 0) processImageFile(e.dataTransfer.files[0])
        })
        fileInput.addEventListener('change', (e) => {
          const files = (e.target as HTMLInputElement).files
          if (files && files.length > 0) processImageFile(files[0])
        })
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          uploadedImage = null
          uploadContent.style.display = 'block'
          imagePreview.style.display = 'none'
          if (fileInput) fileInput.value = ''
        })

        const handlePaste = (e: ClipboardEvent) => {
          const items = e.clipboardData?.items
          if (!items) return
          for (let i = 0; i < items.length; i += 1) {
            if (items[i].type.startsWith('image/')) {
              const file = items[i].getAsFile()
              if (file) processImageFile(file)
              break
            }
          }
        }
        document.addEventListener('paste', handlePaste)
        ;(Swal as any).cleanup = () => document.removeEventListener('paste', handlePaste)
      },
      willClose: () => {
        if ((Swal as any).cleanup) (Swal as any).cleanup()
      },
      preConfirm: () => {
        if (!uploadedImage) {
          Swal.showValidationMessage('Please add an image to confirm')
          return false
        }
        return { value, image: uploadedImage }
      },
    }).then(async (result) => {
      if (!(result.isConfirmed && result.value && result.value.image)) return
      try {
        Swal.fire({
          title: 'Processing...',
          text: 'Please wait while we process your request',
          showConfirmButton: false,
          showCancelButton: false,
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        })

        await createTransactionRequest({
          idGbank: gbank.id,
          value: Number(result.value.value.replace(/,/g, '')),
          image: result.value.image,
        })

        Swal.fire({
          title: 'Success!',
          text: 'Transaction request created successfully and sent for approval',
          icon: 'success',
          confirmButtonText: 'OK',
        })
      } catch (error) {
        await handleApiError(error, 'Failed to create transaction request')
      }
    })
  }

  const fetchGBanks = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const response = await getUserGbanks()
      const formattedGBanks =
        response?.map((gbank: any) => ({
          ...gbank,
          calculatorValue: gbank.calculatorValue
            ? formatCalculatorValue(gbank.calculatorValue.toString())
            : '',
        })) || []
      const sorted = formattedGBanks.sort((a: GBank, b: GBank) => b.balance - a.balance)
      setGbanks(sorted)
    } catch (error) {
      await handleApiError(error, 'Failed to fetch G-Banks')
    } finally {
      if (showLoading) {
        setIsLoading(false)
        setHasCompletedInitialFetch(true)
      }
    }
  }

  useEffect(() => {
    if (hasCompletedInitialFetch && !isLoading && !hasReportedInitialLoad.current) {
      hasReportedInitialLoad.current = true
      onInitialLoadComplete?.()
    }
  }, [hasCompletedInitialFetch, isLoading, onInitialLoadComplete])

  useEffect(() => {
    fetchGBanks(true)
    const interval = setInterval(() => fetchGBanks(false), 60000)
    return () => clearInterval(interval)
  }, [])

  const grouped = useMemo(() => {
    const byColor = gbanks.reduce((acc, g) => {
      const color =
        TEAM_ID_TO_COLOR_MAP[g.idTeam] ||
        DEFAULT_TEAM_COLOR
      const label = COLOR_OPTIONS.find((o) => o.value === color)?.label || 'Chefe de cozinha'
      if (!acc[color]) acc[color] = { color, label, items: [] as GBank[] }
      acc[color].items.push(g)
      return acc
    }, {} as Record<string, GBankGroup>)

    return Object.values(byColor)
      .sort((a, b) => compareByPriority(a.label, b.label))
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => b.balance - a.balance),
      }))
  }, [gbanks])

  const toggleGroupExpansion = (color: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(color)) next.delete(color)
      else next.add(color)
      return next
    })
  }

  const handleCreateGBank = async () => {
    if (!selectedTeam) {
      await handleApiError(new Error('No selected team for G-Bank creation'), 'Failed to add G-Bank')
      return
    }
    setIsSubmitting(true)
    try {
      await createGBank({ name: newGBankName, idTeam: selectedTeam })
      setNewGBankName('')
      setIsCreateModalOpen(false)
      await fetchGBanks(false)
    } catch (error) {
      await handleApiError(error, 'Failed to add G-Bank')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]'>
        {canCreateGBank ? (
          <div className='border-b border-white/10 p-3'>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className='inline-flex h-10 min-w-[120px] items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/45'
            >
              Add G-Bank
            </button>
          </div>
        ) : null}

        <div className='flex-1 overflow-y-auto p-2'>
          {shouldShowInlineLoading ? (
            <div className='rounded-md border border-white/10 bg-black/25 px-3 pb-8 pt-14 text-center text-white/70'>
              <LoadingSpinner size='md' label='Loading gbank data' />
            </div>
          ) : grouped.length === 0 ? (
            <div className='rounded-md border border-white/10 bg-black/25 p-4 text-center text-white/70'>
              No G-Bank found
            </div>
          ) : (
            <div className='space-y-2'>
              {grouped.map((group) => {
                const expanded = expandedGroups.has(group.color)
                return (
                  <div key={group.color} className='overflow-hidden rounded-md border border-white/10'>
                    <button
                      className='flex w-full items-center justify-between px-3 py-3 text-left'
                      style={{
                        background: group.color,
                        color: group.label === 'Milharal' ? '#000' : '#fff',
                      }}
                      onClick={() => toggleGroupExpansion(group.color)}
                    >
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold'>{group.label}</span>
                        <span className='text-xs'>({group.items.length} item{group.items.length !== 1 ? 's' : ''})</span>
                      </div>
                      <CaretDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>

                    {expanded ? (
                      <div className='overflow-x-auto bg-white/[0.03]'>
                        <table className='w-full border-collapse text-sm text-white/90'>
                          <thead className='bg-[#121217] text-xs uppercase tracking-wide text-white/60'>
                            <tr>
                              <th className='px-3 py-3 text-left'>Name</th>
                              <th className='px-3 py-3 text-center'>Total</th>
                              <th className='px-3 py-3 text-center'>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items.map((g) => (
                              <tr key={g.id} className='border-t border-white/10'>
                                <td className='px-3 py-3'>{g.name}</td>
                                <td className='px-3 py-3 text-center'>
                                  {formatRoundedIntNoNegativeZero(g.balance)}
                                </td>
                                <td className='px-3 py-3 text-center'>
                                  <input
                                    className='h-9 min-w-[120px] rounded-md border border-white/15 bg-black/30 px-2 text-center text-sm text-white outline-none transition focus:border-purple-400'
                                    type='text'
                                    value={g.calculatorValue}
                                    onChange={(e) => {
                                      const formatted = formatCalculatorValue(e.target.value)
                                      setGbanks((prev) =>
                                        prev.map((gbank) =>
                                          gbank.id === g.id ? { ...gbank, calculatorValue: formatted } : gbank
                                        )
                                      )
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        const value = e.currentTarget.value
                                        if (value.trim()) showUploadModal(g, value)
                                      }
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
          <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#101014] p-5 shadow-2xl'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-white'>Add New G-Bank</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className='rounded-md border border-white/15 p-1 text-white/80 transition hover:text-white'
              >
                <X size={16} />
              </button>
            </div>
            <div className='space-y-3'>
              <div>
                <label className='mb-1 block text-xs uppercase tracking-wide text-white/60'>Team</label>
                <input
                  readOnly
                  value={selectedTeamLabel}
                  className='w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/80'
                />
              </div>
              <div>
                <label className='mb-1 block text-xs uppercase tracking-wide text-white/60'>Name</label>
                <input
                  value={newGBankName}
                  onChange={(e) => setNewGBankName(e.target.value)}
                  className='w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-400'
                />
              </div>
            </div>
            <div className='mt-5 flex justify-end gap-2'>
              <button
                className='rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5'
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className='rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60'
                onClick={handleCreateGBank}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
