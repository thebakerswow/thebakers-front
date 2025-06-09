import { useState } from 'react'
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

const initialServices = [
  {
    id: 1,
    name: 'Premium Haircut',
    description: 'High quality haircut',
    price: 30,
  },
  {
    id: 2,
    name: 'Beard Trim',
    description: 'Professional beard trim',
    price: 15,
  },
  {
    id: 3,
    name: 'Luxury Spa',
    description: 'Relaxing spa experience',
    price: 50,
  },
]

export default function PriceTableManagement() {
  const [services, setServices] = useState(initialServices)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '' })

  const handleOpen = (service = null) => {
    setEditing(service)

    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = () => {}

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This service will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#888',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        setServices(services.filter((s) => s.id !== id))
        Swal.fire('Deleted!', 'Service has been deleted.', 'success')
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
                  ${service.price}
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
            type='number'
            fullWidth
            value={form.price}
            onChange={handleChange}
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
