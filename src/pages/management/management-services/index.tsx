import { useState, useEffect } from 'react'
import {
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
import CloseIcon from '@mui/icons-material/Close'
import Swal from 'sweetalert2'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from '../../../services/api/services'
import {
  Service,
  ServiceForm,
  ServiceCategory,
  CategoryForm,
} from '../../../types'

const emptyForm: ServiceForm = {
  name: '',
  description: '',
  price: '',
  serviceCategoryId: '',
  hotItem: false, // novo campo
}

export default function PriceTableManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [_, setLoading] = useState(false)
  const [openCategories, setOpenCategories] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  // --- CATEGORIAS ---
  const emptyCategoryForm: CategoryForm = { name: '' }
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm)
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null)
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)

  // Ordenação
  type OrderBy = 'name' | 'price' | 'category'
  const [orderBy, setOrderBy] = useState<OrderBy>('name')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  // Handle errors
  const handleError = (errorDetails: ErrorDetails) => {
    setError(errorDetails)
  }

  const clearError = () => {
    setError(null)
  }

  // Buscar serviços e categorias ao montar
  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await getServices()
      setServices(res)
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Failed to fetch services', response: error }

      handleError(errorDetails)
    } finally {
      setLoading(false)
    }
  }

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

      handleError(errorDetails)
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
    if (!name || !price || !serviceCategoryId) {
      const errorDetails = {
        message: 'Please fill all required fields',
        response: null,
      }
      handleError(errorDetails)
      return
    }
    try {
      if (editing) {
        // Editar serviço
        await updateService({
          id: editing.id,
          name,
          description,
          price: Number(price.replace(/,/g, '')),
          serviceCategoryId: Number(serviceCategoryId),
          hotItem, // novo campo
        })
        Swal.fire('Success', 'Service updated!', 'success')
      } else {
        // Adicionar serviço
        await createService({
          name,
          description,
          price: Number(price.replace(/,/g, '')),
          serviceCategoryId: Number(serviceCategoryId),
          hotItem, // novo campo
        })
        Swal.fire('Success', 'Service added!', 'success')
      }
      handleClose()
      fetchServices()
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.response?.data?.message || error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }

      handleError(errorDetails)
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
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          await deleteService(id)
          setServices((prev) => prev.filter((s) => s.id !== id))
          Swal.fire('Deleted!', 'Service has been deleted.', 'success')
        } catch (error) {
          const errorDetails = axios.isAxiosError(error)
            ? {
                message: error.response?.data?.message || error.message,
                response: error.response?.data,
                status: error.response?.status,
              }
            : { message: 'Unexpected error', response: error }

          handleError(errorDetails)
        }
      }
    })
  }

  const handleOpenCategoryDialog = (
    category: ServiceCategory | null = null
  ) => {
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
      const errorDetails = { message: 'Please fill the name', response: null }
      handleError(errorDetails)
      return
    }
    try {
      if (editingCategory) {
        await updateServiceCategory({
          id: editingCategory.id,
          name,
        })
        Swal.fire('Success', 'Category updated!', 'success')
      } else {
        await createServiceCategory({
          name,
        })
        Swal.fire('Success', 'Category added!', 'success')
      }
      handleCloseCategoryDialog()
      fetchCategories()
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            message: error.response?.data?.message || error.message,
            response: error.response?.data,
            status: error.response?.status,
          }
        : { message: 'Unexpected error', response: error }

      handleError(errorDetails)
    }
  }

  const handleDeleteCategory = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This category and all services related will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#888',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          await deleteServiceCategory(id)
          setCategories((prev) => prev.filter((c) => c.id !== id))
          Swal.fire('Deleted!', 'Category has been deleted.', 'success')
        } catch (error) {
          const errorDetails = axios.isAxiosError(error)
            ? {
                message: error.response?.data?.message || error.message,
                response: error.response?.data,
                status: error.response?.status,
              }
            : { message: 'Unexpected error', response: error }

          handleError(errorDetails)
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
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
        <div className='mb-6 flex justify-between'>
          <Typography variant='h4' fontWeight='bold'>
            Price Table Management
          </Typography>
          <div>
            <Button
              variant='contained'
              color='error'
              onClick={() => setOpenCategories(true)}
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                mr: 2,
              }}
            >
              Manage Categories
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={() => handleOpen()}
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              }}
            >
              Add Service
            </Button>
          </div>
        </div>
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
                  {orderBy === 'category'
                    ? order === 'asc'
                      ? ' ▲'
                      : ' ▼'
                    : ''}
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
                        categories.find(
                          (c) => c.id === service.serviceCategoryId
                        )?.name ||
                        '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#b0b0b0', textAlign: 'center' }}>
                      {service.hotItem ? '🔥' : ''}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color='error'
                        onClick={() => handleOpen(service)}
                        sx={{
                          color: 'rgb(147, 51, 234)',
                          '&:hover': { color: 'rgb(168, 85, 247)' },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color='error'
                        onClick={() => handleDelete(service.id)}
                        sx={{
                          color: 'rgb(147, 51, 234)',
                          '&:hover': { color: 'rgb(168, 85, 247)' },
                        }}
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
          <DialogTitle className='relative'>
            {editing ? 'Edit Service' : 'Add Service'}
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
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
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
              {error && <ErrorComponent error={error} onClose={clearError} />}
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
              sx={{
                backgroundColor: 'rgb(147, 51, 234)',
                '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
              }}
            >
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <Typography variant='h6' fontWeight='bold'>
                Category Management
              </Typography>
              <Button
                variant='contained'
                color='error'
                onClick={() => handleOpenCategoryDialog()}
                sx={{
                  backgroundColor: 'rgb(147, 51, 234)',
                  '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                }}
              >
                Add Category
              </Button>
            </div>
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
                            sx={{
                              color: 'rgb(147, 51, 234)',
                              '&:hover': { color: 'rgb(168, 85, 247)' },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color='error'
                            onClick={() => handleDeleteCategory(category.id)}
                            sx={{
                              color: 'rgb(147, 51, 234)',
                              '&:hover': { color: 'rgb(168, 85, 247)' },
                            }}
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
            <Dialog
              open={openCategoryDialog}
              onClose={handleCloseCategoryDialog}
            >
              <DialogTitle className='relative'>
                {editingCategory ? 'Edit Category' : 'Add Category'}
                <IconButton
                  aria-label='close'
                  onClick={handleCloseCategoryDialog}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ minWidth: 350 }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSaveCategory()
                  }}
                >
                  <TextField
                    margin='dense'
                    label='Category Name'
                    name='name'
                    required
                    fullWidth
                    value={categoryForm.name}
                    onChange={handleChangeCategory}
                  />
                  {error && (
                    <ErrorComponent error={error} onClose={clearError} />
                  )}
                </form>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseCategoryDialog} color='inherit'>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCategory}
                  color='error'
                  variant='contained'
                  sx={{
                    backgroundColor: 'rgb(147, 51, 234)',
                    '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                  }}
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
      </div>
    </div>
  )
}
