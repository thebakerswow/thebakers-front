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
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import CategoryIcon from '@mui/icons-material/Category'
import Swal from 'sweetalert2'
import axios from 'axios'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { AddService } from '../../../components/add-service'
import {
  getServices,
  deleteService,
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from '../../../services/api/services'
import { Service, ServiceCategory, CategoryForm } from '../../../types'

export default function PriceTableManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // --- CATEGORIAS ---
  const emptyCategoryForm: CategoryForm = { name: '' }
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm)
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null)
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)

  // --- DIALOGS ---
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [isCategoryServicesDialogOpen, setIsCategoryServicesDialogOpen] = useState(false)
  const [openCategories, setOpenCategories] = useState(false)

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
    setLoadingServices(true)
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
        : { message: 'Unexpected error', response: null }
      handleError(errorDetails)
    } finally {
      setLoadingServices(false)
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

  // Handle service operations with new component
  const handleServiceAdded = () => {
    fetchServices()
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setIsAddServiceOpen(true)
  }

  const handleAddService = () => {
    setEditingService(null)
    setIsAddServiceOpen(true)
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

  // Handle category card click
  const handleCategoryClick = (category: ServiceCategory) => {
    setSelectedCategory(category)
    setIsCategoryServicesDialogOpen(true)
  }

  // Handle close category services dialog
  const handleCloseCategoryServicesDialog = () => {
    setIsCategoryServicesDialogOpen(false)
    setSelectedCategory(null)
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

  // Get services for a specific category
  const getServicesForCategory = (categoryId: number) => {
    return services.filter(service => service.serviceCategoryId === categoryId)
  }

  return (
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
                 <div className='mb-6 flex justify-between'>
           <Typography variant='h4' fontWeight='bold'>
             Price Table Management
           </Typography>
           <Button
             variant='contained'
             color='error'
             onClick={() => setOpenCategories(true)}
             sx={{
               backgroundColor: 'rgb(147, 51, 234)',
               '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
             }}
           >
             Manage Categories
           </Button>
         </div>

        {/* Categories Grid */}
        {loadingServices ? (
          <div className='flex h-40 items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-purple-400'></div>
              <span className='text-gray-400'>Loading services...</span>
            </div>
          </div>
        ) : (
          <Grid container spacing={3}>
            {categories.map((category) => {
              const servicesInCategory = getServicesForCategory(category.id)
              const serviceCount = servicesInCategory.length
              const hotServicesCount = servicesInCategory.filter(s => s.hotItem).length

              return (
                                 <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                   <Card
                     className='cursor-pointer transition-all hover:scale-105 hover:shadow-lg'
                     sx={{
                       bgcolor: '#1a1a1a',
                       border: '1px solid #333',
                       height: 200, // Altura fixa para todos os cards
                       display: 'flex',
                       flexDirection: 'column',
                       '&:hover': {
                         borderColor: 'rgb(147, 51, 234)',
                         bgcolor: '#2a2a2a',
                       },
                     }}
                     onClick={() => handleCategoryClick(category)}
                   >
                     <CardContent 
                       className='text-center'
                       sx={{ 
                         flexGrow: 1,
                         display: 'flex',
                         flexDirection: 'column',
                         justifyContent: 'space-between',
                         p: 2
                       }}
                     >
                       <div>
                         <div className='mb-3 flex justify-center'>
                           <CategoryIcon 
                             sx={{ 
                               fontSize: 40, 
                               color: 'rgb(147, 51, 234)' 
                             }} 
                           />
                         </div>
                         <Typography 
                           variant='h6' 
                           component='h3'
                           sx={{ 
                             color: '#fff',
                             fontWeight: 'bold',
                             mb: 1,
                             fontSize: '1.1rem',
                             lineHeight: 1.2
                           }}
                         >
                           {category.name}
                         </Typography>
                         <Typography 
                           variant='body2' 
                           sx={{ 
                             color: '#b0b0b0',
                             mb: 1,
                             fontSize: '0.875rem'
                           }}
                         >
                           {serviceCount} service{serviceCount !== 1 ? 's' : ''} available
                         </Typography>
                       </div>
                       
                       <div className='flex flex-col gap-1'>
                         {hotServicesCount > 0 && (
                           <Chip
                             label={`${hotServicesCount} 🔥 Hot`}
                             size='small'
                             sx={{
                               bgcolor: 'rgba(147, 51, 234, 0.2)',
                               color: 'rgb(147, 51, 234)',
                               border: '1px solid rgb(147, 51, 234)',
                               alignSelf: 'center',
                               fontSize: '0.7rem',
                               height: 20,
                               '& .MuiChip-label': {
                                 px: 1,
                               }
                             }}
                           />
                         )}
                         <Typography 
                           variant='caption' 
                           sx={{ 
                             color: 'rgb(147, 51, 234)',
                             fontSize: '0.75rem',
                             textAlign: 'center'
                           }}
                         >
                           Click to view services
                         </Typography>
                       </div>
                     </CardContent>
                   </Card>
                 </Grid>
              )
            })}
          </Grid>
        )}

        {/* Dialog for Category Services */}
        <Dialog
          open={isCategoryServicesDialogOpen}
          onClose={handleCloseCategoryServicesDialog}
          maxWidth='lg'
          fullWidth
        >
          <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
            {selectedCategory && (
              <>
                                 <div className='mb-6 flex items-center justify-between border-b border-zinc-700 pb-4'>
                   <div className='flex items-center gap-3'>
                     <CategoryIcon sx={{ color: 'rgb(147, 51, 234)' }} />
                     <Typography variant='h5' fontWeight='bold'>
                       {selectedCategory.name} Services
                     </Typography>
                   </div>
                   <div className='flex items-center gap-2'>
                     <Button
                       variant='contained'
                       size='small'
                       onClick={handleAddService}
                       sx={{
                         backgroundColor: 'rgb(147, 51, 234)',
                         '&:hover': { backgroundColor: 'rgb(168, 85, 247)' },
                         fontSize: '0.875rem',
                         px: 2,
                         py: 0.5,
                       }}
                     >
                       Add Service
                     </Button>
                     <IconButton
                       onClick={handleCloseCategoryServicesDialog}
                       sx={{ color: '#fff' }}
                     >
                       <CloseIcon />
                     </IconButton>
                   </div>
                 </div>

                {/* Services Grid */}
                {getServicesForCategory(selectedCategory.id).length === 0 ? (
                  <div className='flex h-40 items-center justify-center'>
                    <span className='text-gray-400'>No services in this category</span>
                  </div>
                ) : (
                  <Grid container spacing={3}>
                    {getServicesForCategory(selectedCategory.id).map((service) => (
                      <Grid item xs={12} sm={6} md={4} key={service.id}>
                        <Card
                          sx={{
                            bgcolor: '#2a2a2a',
                            border: '1px solid #333',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            '&:hover': {
                              borderColor: 'rgb(147, 51, 234)',
                              bgcolor: '#3a3a3a',
                            },
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Hot Badge */}
                            {service.hotItem && (
                              <Chip
                                label='🔥 HOT'
                                size='small'
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'rgba(147, 51, 234, 0.2)',
                                  color: 'rgb(147, 51, 234)',
                                  border: '1px solid rgb(147, 51, 234)',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}

                            {/* Service Name */}
                            <Typography 
                              variant='h6' 
                              component='h3'
                              sx={{ 
                                color: '#fff',
                                fontWeight: 'bold',
                                mb: 2,
                                pr: service.hotItem ? 6 : 0,
                              }}
                            >
                              {service.name}
                            </Typography>

                            {/* Service Description */}
                            <Typography 
                              variant='body2' 
                              sx={{ 
                                color: '#b0b0b0',
                                mb: 3,
                                flexGrow: 1,
                                lineHeight: 1.5,
                              }}
                            >
                              {service.description}
                            </Typography>

                            {/* Price */}
                            <Typography 
                              variant='h5' 
                              sx={{ 
                                color: 'rgb(147, 51, 234)',
                                fontWeight: 'bold',
                                mb: 2,
                              }}
                            >
                              {service.price
                                .toLocaleString('en-US', { maximumFractionDigits: 0 })
                                .replace(/,/g, ',')}g
                            </Typography>

                            {/* Actions */}
                            <div className='flex justify-end gap-1'>
                              <IconButton
                                size='small'
                                onClick={() => handleEditService(service)}
                                sx={{
                                  color: 'rgb(147, 51, 234)',
                                  '&:hover': { 
                                    color: 'rgb(168, 85, 247)',
                                    bgcolor: 'rgba(147, 51, 234, 0.1)',
                                  },
                                }}
                              >
                                <EditIcon fontSize='small' />
                              </IconButton>
                              <IconButton
                                size='small'
                                onClick={() => handleDelete(service.id)}
                                sx={{
                                  color: '#ef4444',
                                  '&:hover': { 
                                    color: '#dc2626',
                                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                                  },
                                }}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </div>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </DialogContent>
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

        {/* AddService Component */}
        {isAddServiceOpen && (
          <AddService
            open={isAddServiceOpen}
            onClose={() => {
              setIsAddServiceOpen(false)
              setEditingService(null)
            }}
            onServiceAdded={handleServiceAdded}
            onError={handleError}
            editingService={editingService}
          />
        )}
      </div>
    </div>
  )
}
