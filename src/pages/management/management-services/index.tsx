import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Paper,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Swal from 'sweetalert2'
import { api } from '../../../services/axiosConfig'

// Tipos
interface Service {
  id: number
  name: string
  description: string
  price: number
}

interface ServiceForm {
  name: string
  description: string
  price: string
}

const emptyForm: ServiceForm = { name: '', description: '', price: '' }

export default function PriceTableManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [loading, setLoading] = useState(false)

  // Buscar serviços ao montar
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await api.get('/services')
      setServices(res.data.info)
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch services', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (service: Service | null = null) => {
    setEditing(service)
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        price: formatPriceInput(String(service.price)), // aplica formatação ao abrir o edit
      })
    } else {
      setForm(emptyForm)
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  // Formata o valor inserido com vírgula como separador de milhar (ex: 111111 => 111,111)
  function formatPriceInput(value: string) {
    if (!value) return ''
    // Remove tudo que não for número
    let clean = value.replace(/\D/g, '')
    if (!clean) return ''
    // Adiciona vírgula a cada 3 dígitos da direita para a esquerda
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Novo handleChange para o campo price
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'price') {
      setForm({ ...form, [name]: formatPriceInput(value) })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSave = async () => {
    const { name, description, price } = form
    if (!name || !description || !price) {
      Swal.fire('Error', 'Please fill all fields', 'warning')
      return
    }
    try {
      if (editing) {
        // Editar serviço
        await api.put('/services', {
          id: editing.id,
          name,
          description,
          price: Number(price.replace(/,/g, '')),
        })
        Swal.fire('Success', 'Service updated!', 'success')
      } else {
        // Adicionar serviço
        await api.post('/services', {
          name,
          description,
          price: Number(price.replace(/,/g, '')),
        })
        Swal.fire('Success', 'Service added!', 'success')
      }
      handleClose()
      fetchServices()
    } catch (err: any) {
      Swal.fire('Error', err?.response?.data?.message || err.message, 'error')
    }
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This service will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#888',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/services/${id}`)
          setServices((prev) => prev.filter((s) => s.id !== id))
          Swal.fire('Deleted!', 'Service has been deleted.', 'success')
        } catch (err: any) {
          Swal.fire(
            'Error',
            err?.response?.data?.message || err.message,
            'error'
          )
        }
      }
    })
  }

  return (
    <Box
      sx={{
        width: '100%',
        m: 2,
        minHeight: '100vh',
        bgcolor: '#111',
        color: '#fff',
        p: 4,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant='h4' fontWeight='bold'>
          Price Table Management
        </Typography>
        <Button variant='contained' color='error' onClick={() => handleOpen()}>
          Add Service
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ bgcolor: '#18181b' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#b0b0b0' }}>Service</TableCell>
              <TableCell sx={{ color: '#b0b0b0' }}>Description</TableCell>
              <TableCell sx={{ color: '#b0b0b0' }}>Price</TableCell>
              <TableCell sx={{ color: '#b0b0b0' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id} hover>
                <TableCell sx={{ color: '#b0b0b0' }}>{service.name}</TableCell>
                <TableCell sx={{ color: '#b0b0b0' }}>
                  {service.description}
                </TableCell>
                <TableCell sx={{ color: '#b0b0b0' }}>
                  {(() => {
                    // Exibe separador de milhar como vírgula, sem casas decimais
                    return service.price
                      .toLocaleString('en-US', { maximumFractionDigits: 0 })
                      .replace(/,/g, ',')
                  })()}
                </TableCell>
                <TableCell>
                  <IconButton color='error' onClick={() => handleOpen(service)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color='error'
                    onClick={() => handleDelete(service.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Add/Edit */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
        <DialogContent sx={{ minWidth: 350 }}>
          <TextField
            margin='dense'
            label='Service Name'
            name='name'
            fullWidth
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            margin='dense'
            label='Description'
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
            fullWidth
            value={form.price}
            onChange={handleChange}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9,]*' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleSave} color='error' variant='contained'>
            {editing ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
