import { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Swal from 'sweetalert2'
import axios from 'axios'
import { ErrorDetails } from './error-display'
import {

  createService,
  updateService,
  getServiceCategories,
} from '../services/api/services'
import { Service, ServiceForm, ServiceCategory } from '../types'

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
  editingService?: Service | null
  categoryId?: number
}

export function AddService({
  open,
  onClose,
  onServiceAdded,
  onError,
  editingService,
  categoryId,
}: AddServiceProps) {
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
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Failed to fetch categories', response: error }

      onError(errorDetails)
    }
  }

  const handleOpen = (service: Service | null = null) => {
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        price: formatPriceInput(String(service.price)),
        serviceCategoryId: String(service.serviceCategoryId),
        hotItem: !!service.hotItem,
      })
    } else {
      setForm({
        ...emptyForm,
        serviceCategoryId: categoryId ? String(categoryId) : '',
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, checked } = e.target as any
    if (name === 'price') {
      setForm({ ...form, [name]: formatPriceInput(value as string) })
    } else if (name === 'hotItem') {
      setForm({ ...form, hotItem: checked })
    } else {
      setForm({ ...form, [name as string]: value as string })
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
      if (editingService) {
        await updateService({
          id: editingService.id,
          name,
          description,
          price: Number(price.replace(/,/g, '')),
          serviceCategoryId: Number(serviceCategoryId),
          hotItem,
        })
        Swal.fire('Success', 'Service updated!', 'success')
      } else {
        await createService({
          name,
          description,
          price: Number(price.replace(/,/g, '')),
          serviceCategoryId: Number(serviceCategoryId),
          hotItem,
        })
        Swal.fire('Success', 'Service added!', 'success')
      }
      handleClose()
      onServiceAdded()
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.response?.data?.message || error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }

      onError(errorDetails)
    } finally {
      setLoading(false)
    }
  }

  // Reset form when editing service changes
  useEffect(() => {
    if (open) {
      handleOpen(editingService)
    }
  }, [editingService, open])

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className='relative'>
        {editingService ? 'Edit Service' : 'Add Service'}
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ minWidth: 350 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <TextField
            margin='dense'
            label='Service Name'
            name='name'
            required
            fullWidth
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            margin='dense'
            label='Description'
            required
            name='description'
            fullWidth
            value={form.description}
            onChange={handleChange}
          />
          <TextField
            margin='dense'
            label='Price'
            name='price'
            type='text'
            required
            fullWidth
            value={form.price}
            onChange={handleChange}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9,]*' }}
          />
          <div>
            <Typography variant='subtitle2' sx={{ color: '#b0b0b0' }}>
              Category *
            </Typography>
            <Select
              name='serviceCategoryId'
              value={form.serviceCategoryId}
              required
              onChange={(event) => {
                const { name, value } = event.target as {
                  name: string
                  value: string
                }
                setForm({ ...form, [name]: value })
              }}
              style={{
                width: '100%',
              }}
            >
              <MenuItem value='' disabled>
                Select a category
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type='checkbox'
                name='hotItem'
                checked={form.hotItem}
                onChange={handleChange}
                style={{ accentColor: '#d32f2f', width: 18, height: 18 }}
              />
              <span>Hot Item</span>
            </label>
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='inherit'>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color='error'
          variant='contained'
          disabled={loading}
          sx={{
            backgroundColor: 'rgb(147, 51, 234)',
            '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
          }}
        >
          {loading ? 'Saving...' : editingService ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
