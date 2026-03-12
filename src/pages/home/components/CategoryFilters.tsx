import { AnimatePresence, motion } from 'framer-motion'
import { CalendarBlank, CaretDown } from '@phosphor-icons/react'
import { CategoryFiltersProps } from '../types/home'

export function CategoryFilters({
  categoriesWithServices,
  activeCategory,
  filtersOpen,
  onSetFiltersOpen,
  onSelectCategory,
  onScrollToSchedule,
}: CategoryFiltersProps) {
  const activeCategoryLabel = activeCategory
    ? categoriesWithServices.find((c) => String(c.category.id) === activeCategory)?.category.name ||
      'Filter'
    : 'All Categories'

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className='sticky top-0 z-20 border-y border-white/5 bg-black/60 py-4 backdrop-blur-xl'
    >
      <div className='mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-12 2xl:px-16'>
        <div className='flex items-center gap-3 md:hidden'>
          <button
            onClick={() => onSetFiltersOpen(!filtersOpen)}
            className='flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium uppercase tracking-wide text-gray-300 transition-all duration-300'
          >
            {activeCategoryLabel}
            <CaretDown
              size={16}
              className={`transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={onScrollToSchedule}
            className='ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium uppercase tracking-wide text-gray-400 transition-all duration-300 hover:border-white/20 hover:text-white'
          >
            <CalendarBlank size={14} />
            Schedule
          </button>
        </div>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className='overflow-hidden md:hidden'
            >
              <div className='flex flex-wrap gap-2 pt-3'>
                <button
                  onClick={() => {
                    onSelectCategory(null)
                    onSetFiltersOpen(false)
                  }}
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 ${
                    !activeCategory
                      ? 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                      : 'border border-white/10 text-gray-400'
                  }`}
                >
                  All
                </button>
                {categoriesWithServices.map(({ category }) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onSelectCategory(String(category.id))
                      onSetFiltersOpen(false)
                    }}
                    className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 ${
                      activeCategory === String(category.id)
                        ? 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                        : 'border border-white/10 text-gray-400'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='hidden flex-wrap items-center gap-3 md:flex'>
          <button
            onClick={() => onSelectCategory(null)}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 ${
              !activeCategory
                ? 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            All
          </button>
          {categoriesWithServices.map(({ category }) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(String(category.id))}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 ${
                activeCategory === String(category.id)
                  ? 'border border-purple-500/30 bg-purple-500/20 text-purple-300'
                  : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
          <div className='h-5 w-px shrink-0 bg-white/10' />
          <button
            onClick={onScrollToSchedule}
            className='inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm font-medium uppercase tracking-wide text-gray-400 transition-all duration-300 hover:border-white/20 hover:text-white'
          >
            <CalendarBlank size={14} />
            Schedule
          </button>
        </div>
      </div>
    </motion.section>
  )
}
