import { useEffect, useState } from 'react'
import { Fire, FolderSimple, PencilSimple, Plus, Trash, X } from '@phosphor-icons/react'
import Swal from 'sweetalert2'
import { ErrorComponent, ErrorDetails } from '../../../components/error-display'
import { getApiErrorMessage } from '../../../utils/apiErrorHandler'
import { AddService } from './components/AddService'
import { CategoriesSkeletonGrid } from './components/ServicesManagementSkeleton'
import { EditService } from './components/EditService'
import { ServiceCard } from './components/ServiceCard'
import {
  getServices,
  deleteService,
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from './services/servicesManagementApi'
import { Service, ServiceCategory, CategoryForm } from './types/servicesManagement'

export default function PriceTableManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const emptyCategoryForm: CategoryForm = { name: '' }
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [isCategoryServicesDialogOpen, setIsCategoryServicesDialogOpen] = useState(false)
  const [openCategories, setOpenCategories] = useState(false)

  const handleError = (errorDetails: ErrorDetails) => setError(errorDetails)
  const clearError = () => setError(null)

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
      handleError({
        message: getApiErrorMessage(error, 'Failed to fetch services'),
        response: null,
      })
    } finally {
      setLoadingServices(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await getServiceCategories()
      setCategories(Array.isArray(res) ? res : [])
    } catch (error) {
      handleError({
        message: getApiErrorMessage(error, 'Failed to fetch categories'),
        response: null,
      })
    }
  }

  const handleServiceAdded = () => fetchServices()

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setIsEditServiceOpen(true)
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
      if (!result.isConfirmed) return
      try {
        await deleteService(id)
        setServices((prev) => prev.filter((s) => s.id !== id))
        Swal.fire('Deleted!', 'Service has been deleted.', 'success')
      } catch (error) {
        handleError({
          message: getApiErrorMessage(error, 'Failed to delete service'),
          response: null,
        })
      }
    })
  }

  const handleCategoryClick = (category: ServiceCategory) => {
    setSelectedCategory(category)
    setIsCategoryServicesDialogOpen(true)
  }

  const handleCloseCategoryServicesDialog = () => {
    setIsCategoryServicesDialogOpen(false)
    setSelectedCategory(null)
  }

  const handleOpenCategoryDialog = (category: ServiceCategory | null = null) => {
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
      handleError({ message: 'Please fill the name', response: null })
      return
    }
    try {
      if (editingCategory) {
        await updateServiceCategory({ id: editingCategory.id, name })
        Swal.fire('Success', 'Category updated!', 'success')
      } else {
        await createServiceCategory({ name })
        Swal.fire('Success', 'Category added!', 'success')
      }
      handleCloseCategoryDialog()
      fetchCategories()
    } catch (error) {
      handleError({
        message: getApiErrorMessage(error, 'Failed to save category'),
        response: null,
      })
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
      if (!result.isConfirmed) return
      try {
        await deleteServiceCategory(id)
        setCategories((prev) => prev.filter((c) => c.id !== id))
        Swal.fire('Deleted!', 'Category has been deleted.', 'success')
      } catch (error) {
        handleError({
          message: getApiErrorMessage(error, 'Failed to delete category'),
          response: null,
        })
      }
    })
  }

  const getServicesForCategory = (categoryId: number) =>
    services.filter((service) => service.serviceCategoryId === categoryId)

  return (
    <div className='flex w-full flex-col overflow-auto p-6'>
      <div className='min-h-full w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 pb-8 text-white shadow-2xl'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
          <button
            type='button'
            onClick={() => setOpenCategories(true)}
            className='inline-flex h-10 items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-4 text-sm font-medium text-purple-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)] transition hover:border-purple-300/55 hover:bg-purple-500/30 hover:text-white'
          >
            Manage Categories
          </button>
        </div>
        <div className='my-4 h-px w-full bg-gradient-to-r from-transparent via-purple-400/35 to-transparent' />

        {loadingServices ? (
          <CategoriesSkeletonGrid />
        ) : (
          <div className='grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {categories.map((category) => {
              const servicesInCategory = getServicesForCategory(category.id)
              const serviceCount = servicesInCategory.length
              const hotServicesCount = servicesInCategory.filter((s) => s.hotItem).length

              return (
                <button
                  key={category.id}
                  type='button'
                  onClick={() => handleCategoryClick(category)}
                  className='h-[200px] rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-lg'
                >
                  <div className='flex h-full flex-col justify-between'>
                    <div>
                      <div className='mb-3 flex justify-center text-purple-400'>
                        <FolderSimple size={40} weight='duotone' />
                      </div>
                      <h3 className='mb-1 text-center text-lg font-bold text-white'>{category.name}</h3>
                      <p className='text-center text-sm text-neutral-400'>
                        {serviceCount} service{serviceCount !== 1 ? 's' : ''} available
                      </p>
                    </div>
                    <div className='flex flex-col items-center gap-1'>
                      {hotServicesCount > 0 ? (
                        <span className='inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400'>
                          <Fire size={12} />
                          {hotServicesCount} Hot
                        </span>
                      ) : null}
                      <span className='text-xs text-purple-300'>Click to view services</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {isCategoryServicesDialogOpen && selectedCategory ? (
          <div className='fixed inset-0 z-[210] flex items-center justify-center bg-black/70 p-4'>
            <div className='flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl'>
              <div className='flex items-center justify-between border-b border-white/10 p-4'>
                <div className='flex items-center gap-2'>
                  <FolderSimple size={22} className='text-purple-400' />
                  <h2 className='text-xl font-semibold text-white'>{selectedCategory.name} Services</h2>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={handleAddService}
                    className='inline-flex h-9 items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-3 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
                  >
                    <Plus size={16} className='mr-1' />
                    Add Service
                  </button>
                  <button
                    type='button'
                    onClick={handleCloseCategoryServicesDialog}
                    className='rounded-md border border-white/10 bg-white/5 p-2 text-white transition hover:border-purple-500/40 hover:text-purple-300'
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className='flex-1 overflow-auto p-4'>
                {getServicesForCategory(selectedCategory.id).length === 0 ? (
                  <div className='flex h-40 items-center justify-center text-neutral-400'>
                    No services in this category
                  </div>
                ) : (
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                    {getServicesForCategory(selectedCategory.id).map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onEdit={handleEditService}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {openCategories ? (
          <div className='fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4'>
            <div className='w-full max-w-3xl rounded-xl border border-white/10 bg-[#1a1a1a] p-4 shadow-2xl'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-white'>Category Management</h2>
                <button
                  type='button'
                  onClick={() => handleOpenCategoryDialog()}
                  className='inline-flex h-9 items-center justify-center rounded-md border border-purple-400/40 bg-purple-500/20 px-3 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
                >
                  <Plus size={16} className='mr-1' />
                  Add Category
                </button>
              </div>

              <div className='overflow-hidden rounded-md border border-white/10'>
                <table className='w-full text-sm'>
                  <thead className='bg-white/[0.06] text-neutral-300'>
                    <tr>
                      <th className='px-3 py-2 text-left font-semibold'>Category</th>
                      <th className='px-3 py-2 text-right font-semibold'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id} className='border-t border-white/5'>
                        <td className='px-3 py-2 text-white'>{category.name}</td>
                        <td className='px-3 py-2 text-right'>
                          <button
                            type='button'
                            onClick={() => handleOpenCategoryDialog(category)}
                            className='mr-1 rounded-md p-2 text-purple-300 transition hover:bg-purple-500/15 hover:text-purple-200'
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button
                            type='button'
                            onClick={() => handleDeleteCategory(category.id)}
                            className='rounded-md p-2 text-red-400 transition hover:bg-red-500/15 hover:text-red-300'
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='mt-4 flex justify-end'>
                <button
                  type='button'
                  onClick={() => setOpenCategories(false)}
                  className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {openCategoryDialog ? (
          <div className='fixed inset-0 z-[230] flex items-center justify-center bg-black/70 p-4'>
            <div className='w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-4 shadow-2xl'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-white'>
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  type='button'
                  onClick={handleCloseCategoryDialog}
                  className='rounded-md border border-white/10 bg-white/5 p-1.5 text-white transition hover:border-purple-500/40 hover:text-purple-300'
                >
                  <X size={14} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveCategory()
                }}
              >
                <label className='mb-1 block text-xs uppercase tracking-wide text-neutral-300'>
                  Category Name
                </label>
                <input
                  name='name'
                  required
                  value={categoryForm.name}
                  onChange={handleChangeCategory}
                  className='h-10 w-full rounded-md border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none transition focus:border-purple-400/50'
                />
                <div className='mt-4 flex justify-end gap-2'>
                  <button
                    type='button'
                    onClick={handleCloseCategoryDialog}
                    className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='rounded-md border border-purple-400/40 bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-100 transition hover:border-purple-300/55 hover:bg-purple-500/30'
                  >
                    {editingCategory ? 'Save' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {isAddServiceOpen ? (
          <AddService
            open={isAddServiceOpen}
            onClose={() => {
              setIsAddServiceOpen(false)
            }}
            onServiceAdded={handleServiceAdded}
            onError={handleError}
          />
        ) : null}

        {isEditServiceOpen ? (
          <EditService
            open={isEditServiceOpen}
            service={editingService}
            onClose={() => {
              setIsEditServiceOpen(false)
              setEditingService(null)
            }}
            onServiceUpdated={handleServiceAdded}
            onError={handleError}
          />
        ) : null}

        {error ? <ErrorComponent error={error} onClose={clearError} /> : null}
      </div>
    </div>
  )
}
