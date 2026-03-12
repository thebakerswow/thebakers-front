import { ChangeEvent, useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react'
import Swal from 'sweetalert2'
import { ErrorDetails } from '../../../../components/error-display'
import { CustomSelect } from '../../../../components/CustomSelect'
import { getApiErrorMessage } from '../../../../utils/apiErrorHandler'
import {
  createService,
  getServiceCategories,
} from '../services/servicesManagementApi'
import { ServiceForm, ServiceCategory } from '../types/servicesManagement'

const emptyForm: ServiceForm = {
  name: '',
  description: '',
  price: '',
  serviceCategoryId: '',
  hotItem: false,
}

interface AddServiceProps {
  open: boolean
  onClose: () => void
  onServiceAdded: () => void
  onError: (error: ErrorDetails) => void
}

export function AddService({ open, onClose, onServiceAdded, onError }: AddServiceProps) {
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(false)

  // Buscar categorias ao montar
  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    try {
      const res = await getServiceCategories()
      setCategories(Array.isArray(res) ? res : [])
    } catch (error) {
      onError({
        message: getApiErrorMessage(error, 'Failed to fetch categories'),
        response: null,
      })
    }
  }

  const handleClose = () => {
    setForm(emptyForm)
    onClose()
  }

  // Formata o valor inserido com vírgula como separador de milhar
  function formatPriceInput(value: string) {
    if (!value) return ''
    let clean = value.replace(/\D/g, '')
    if (!clean) return ''
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const checked = 'checked' in e.target ? e.target.checked : false
    if (name === 'price') {
      setForm({ ...form, [name]: formatPriceInput(value) })
    } else if (name === 'hotItem') {
      setForm({ ...form, hotItem: checked })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSave = async () => {
    const { name, description, price, serviceCategoryId, hotItem } = form
    if (!name || !price || !serviceCategoryId) {
      const errorDetails = {
        message: 'Please fill all required fields',
        response: null,
      }
      onError(errorDetails)
      return
    }

    setLoading(true)
    try {
      await createService({
        name,
        description,
        price: Number(price.replace(/,/g, '')),
        serviceCategoryId: Number(serviceCategoryId),
        hotItem,
      })
      Swal.fire('Success', 'Service added!', 'success')
      handleClose()
      onServiceAdded()
    } catch (error) {
      onError({
        message: getApiErrorMessage(error, 'Failed to save service'),
        response: null,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setForm(emptyForm)
    }
  }, [open])

  if (!open) return null

  const categoryOptions = categories.map((cat) => ({
    value: String(cat.id),
    label: cat.name,
  }))

  return (
    <div className='fixed inset-0 z-[240] flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Add Service</h3>
          <button
            type='button'
            aria-label='close'
            onClick={handleClose}
            className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className='space-y-3'
        >
          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Service Name *
            </label>
            <input
              name='name'
              required
              value={form.name}
              onChange={handleChange}
              className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Description *
            </label>
            <input
              name='description'
              required
              value={form.description}
              onChange={handleChange}
              className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Price *
            </label>
            <input
              name='price'
              type='text'
              required
              value={form.price}
              onChange={handleChange}
              inputMode='numeric'
              pattern='[0-9,]*'
              className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
              Category *
            </label>
            <CustomSelect
              value={form.serviceCategoryId}
              options={categoryOptions}
              onChange={(value) => setForm((prev) => ({ ...prev, serviceCategoryId: value }))}
              placeholder='Select a category'
              minWidthClassName='min-w-0'
              triggerClassName='h-10 ![background-image:none] !border-white/15 !bg-white/[0.05] !shadow-none text-sm !text-white focus:!border-purple-400/50 focus:!ring-0'
              menuClassName='!border-white/15 !bg-[#1a1a1a]'
              optionClassName='text-white/90 hover:bg-white/10'
              renderInPortal
            />
          </div>

          <label className='mt-1 inline-flex items-center gap-2 text-sm text-neutral-200'>
            <input
              type='checkbox'
              name='hotItem'
              checked={form.hotItem}
              onChange={handleChange}
              className='h-4 w-4 accent-purple-500'
            />
            Hot Item
          </label>

          <div className='mt-4 flex justify-end gap-2'>
            <button
              type='button'
              onClick={handleClose}
              className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading ? 'Saving...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
