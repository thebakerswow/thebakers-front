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
  Select,
  MenuItem,
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
  serviceCategoryId: number
  category?: { id: number; name: string }
  hotItem: boolean // novo campo
}

interface ServiceForm {
  name: string
  description: string
  price: string
  serviceCategoryId: string
  hotItem: boolean // novo campo
}

interface Category {
  id: number
  name: string
}

const emptyForm: ServiceForm = {
  name: '',
  description: '',
  price: '',
  serviceCategoryId: '',
  hotItem: false, // novo campo
}

const swal = Swal.mixin({
  customClass: {
    container: 'swal2-zindex-fix',
  },
})

export default function PriceTableManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [_, setLoading] = useState(false)
  const [openCategories, setOpenCategories] = useState(false)

  // --- CATEGORIAS ---
  interface CategoryForm {
    name: string
  }
  const emptyCategoryForm: CategoryForm = { name: '' }
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)

  // Ordenação
  type OrderBy = 'name' | 'price' | 'category'
  const [orderBy, setOrderBy] = useState<OrderBy>('name')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  // Buscar serviços e categorias ao montar
  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await api.get('/services')
      setServices(res.data.info)
    } catch (err) {
      swal.fire('Error', 'Failed to fetch services', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/services-categories')
      setCategories(Array.isArray(res.data.info) ? res.data.info : [])
    } catch (err) {
      swal.fire('Error', 'Failed to fetch categories', 'error')
    }
  }

  const handleOpen = (service: Service | null = null) => {
    setEditing(service)
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        price: formatPriceInput(String(service.price)),
        serviceCategoryId: String(service.serviceCategoryId),
        hotItem: !!service.hotItem, // novo campo
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
    if (!name || !description || !price || !serviceCategoryId) {
      swal.fire('Error', 'Please fill all fields', 'warning')
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
          serviceCategoryId: Number(serviceCategoryId),
          hotItem, // novo campo
        })
        swal.fire('Success', 'Service updated!', 'success')
      } else {
        // Adicionar serviço
        await api.post('/services', {
          name,
          description,
          price: Number(price.replace(/,/g, '')),
          serviceCategoryId: Number(serviceCategoryId),
          hotItem, // novo campo
        })
        swal.fire('Success', 'Service added!', 'success')
      }
      handleClose()
      fetchServices()
    } catch (err: any) {
      swal.fire('Error', err?.response?.data?.message || err.message, 'error')
    }
  }

  const handleDelete = (id: number) => {
    swal
      .fire({
        title: 'Are you sure?',
        text: 'This service will be deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        cancelButtonColor: '#888',
        confirmButtonText: 'Yes, delete it!',
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.delete(`/services/${id}`)
            setServices((prev) => prev.filter((s) => s.id !== id))
            swal.fire('Deleted!', 'Service has been deleted.', 'success')
          } catch (err: any) {
            swal.fire(
              'Error',
              err?.response?.data?.message || err.message,
              'error'
            )
          }
        }
      })
  }

  const handleOpenCategoryDialog = (category: Category | null = null) => {
    setEditingCategory(category)
    if (category) {
      setCategoryForm({ name: category.name })
    } else {
      setCategoryForm(emptyCategoryForm)
    }
    setOpenCategoryDialog(true)
  }

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false)
    setEditingCategory(null)
    setCategoryForm(emptyCategoryForm)
  }

  const handleChangeCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCategoryForm({ ...categoryForm, [name]: value })
  }

  const handleSaveCategory = async () => {
    const { name } = categoryForm
    if (!name) {
      swal.fire('Error', 'Please fill the name', 'warning')
      return
    }
    try {
      if (editingCategory) {
        await api.put('/services-categories', {
          id: editingCategory.id,
          name,
        })
        swal.fire('Success', 'Category updated!', 'success')
      } else {
        await api.post('/services-categories', {
          name,
        })
        swal.fire('Success', 'Category added!', 'success')
      }
      handleCloseCategoryDialog()
      fetchCategories()
    } catch (err: any) {
      swal.fire('Error', err?.response?.data?.message || err.message, 'error')
    }
  }

  const handleDeleteCategory = (id: number) => {
    swal
      .fire({
        title: 'Are you sure?',
        text: 'This category and all services related will be deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        cancelButtonColor: '#888',
        confirmButtonText: 'Yes, delete it!',
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.delete(`/services-categories/${id}`)
            setCategories((prev) => prev.filter((c) => c.id !== id))
            swal.fire('Deleted!', 'Category has been deleted.', 'success')
          } catch (err: any) {
            swal.fire(
              'Error',
              err?.response?.data?.message || err.message,
              'error'
            )
          }
        }
      })
  }

  // Função para ordenar os serviços
  function getSortedServices() {
    const sorted = [...services]
    sorted.sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''
      if (orderBy === 'name') {
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
      } else if (orderBy === 'price') {
        aValue = a.price
        bValue = b.price
      } else if (orderBy === 'category') {
        aValue =
          a.category?.name ||
          categories.find((c) => c.id === a.serviceCategoryId)?.name ||
          ''
        bValue =
          b.category?.name ||
          categories.find((c) => c.id === b.serviceCategoryId)?.name ||
          ''
        aValue = (aValue as string).toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }
      if (aValue < bValue) return order === 'asc' ? -1 : 1
      if (aValue > bValue) return order === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }

  // Handler para clicar no cabeçalho
  function handleSort(col: OrderBy) {
    if (orderBy === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(col)
      setOrder('asc')
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        m: 4,
        minHeight: '100vh',
        color: '#fff',
        mb: 6, // margem inferior extra
        pb: 6,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant='h4' fontWeight='bold'>
          Price Table Management
        </Typography>
        <Box>
          <Button
            variant='contained'
            color='error'
            onClick={() => setOpenCategories(true)}
            sx={{ mr: 2 }}
          >
            Manage Categories
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={() => handleOpen()}
          >
            Add Service
          </Button>
        </Box>
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: '#111', // background escuro agora acompanha a tabela
          color: '#fff',
          p: 4, // padding interno para a tabela
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ color: '#b0b0b0', cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                Service
                {orderBy === 'name' ? (order === 'asc' ? ' ▲' : ' ▼') : ''}
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0' }}>Description</TableCell>
              <TableCell
                sx={{ color: '#b0b0b0', cursor: 'pointer' }}
                onClick={() => handleSort('price')}
              >
                Price
                {orderBy === 'price' ? (order === 'asc' ? ' ▲' : ' ▼') : ''}
              </TableCell>
              <TableCell
                sx={{ color: '#b0b0b0', cursor: 'pointer' }}
                onClick={() => handleSort('category')}
              >
                Category
                {orderBy === 'category' ? (order === 'asc' ? ' ▲' : ' ▼') : ''}
              </TableCell>
              <TableCell sx={{ color: '#b0b0b0' }}>Hot</TableCell>
              <TableCell sx={{ color: '#b0b0b0' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(services) &&
              getSortedServices().map((service) => (
                <TableRow key={service.id} hover>
                  <TableCell sx={{ color: '#b0b0b0' }}>
                    {service.name}
                  </TableCell>
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
                  <TableCell sx={{ color: '#b0b0b0' }}>
                    {service.category?.name ||
                      categories.find((c) => c.id === service.serviceCategoryId)
                        ?.name ||
                      '-'}
                  </TableCell>
                  <TableCell sx={{ color: '#b0b0b0', textAlign: 'center' }}>
                    {service.hotItem ? '🔥' : ''}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color='error'
                      onClick={() => handleOpen(service)}
                    >
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
          <Box>
            <Typography variant='subtitle2' sx={{ color: '#b0b0b0' }}>
              Category
            </Typography>
            <Select
              name='serviceCategoryId'
              value={form.serviceCategoryId}
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
          </Box>
          <Box sx={{ mt: 2 }}>
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
          </Box>
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

      {/* Dialog for Categories CRUD */}
      <Dialog
        open={openCategories}
        onClose={() => setOpenCategories(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant='h6' fontWeight='bold'>
              Category Management
            </Typography>
            <Button
              variant='contained'
              color='error'
              onClick={() => handleOpenCategoryDialog()}
            >
              Add Category
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <IconButton
                          color='error'
                          onClick={() => handleOpenCategoryDialog(category)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color='error'
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Dialog interno para Add/Edit Category */}
          <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog}>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogContent sx={{ minWidth: 350 }}>
              <TextField
                margin='dense'
                label='Category Name'
                name='name'
                fullWidth
                value={categoryForm.name}
                onChange={handleChangeCategory}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCategoryDialog} color='inherit'>
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategory}
                color='error'
                variant='contained'
              >
                {editingCategory ? 'Save' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategories(false)} color='inherit'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

/* Adicione este CSS globalmente (por exemplo, em App.css ou index.css):
.swal2-zindex-fix {
  z-index: 20000 !important;
}
*/
