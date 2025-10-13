import { useState } from 'react'
import {
  Typography,
  CircularProgress,
  Box,
  Tabs,
  Tab,
} from '@mui/material'
import { ErrorComponent, ErrorDetails } from '../../components/error-display'
import { SellsTab } from './sells-tab'
import { PaymentsTab } from './payments-tab'

export function PaymentsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [isLoading] = useState(false)
  const [error, setError] = useState<ErrorDetails | null>(null)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  if (isLoading) {
    return (
      <div className='w-full overflow-auto overflow-x-hidden pr-20'>
        <div className='m-8 min-h-screen w-full pb-12 text-white'>
          <div className='flex h-40 items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <CircularProgress size={32} sx={{ color: 'rgb(147, 51, 234)' }} />
              <span className='text-gray-400'>Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full overflow-auto overflow-x-hidden pr-20'>
      <div className='m-8 min-h-screen w-full pb-12 text-white'>
        {error && <ErrorComponent error={error} onClose={() => setError(null)} />}
        
        <div className='mb-6'>
          <Typography variant='h4' fontWeight='bold'>
            Payments Management
          </Typography>
        </div>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: '#333', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: '#9ca3af',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                minWidth: 120,
                '&.Mui-selected': {
                  color: 'rgb(147, 51, 234)',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'rgb(147, 51, 234)',
                height: 3,
              },
            }}
          >
            <Tab label="Sells" />
            <Tab label="Payments" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && <SellsTab onError={setError} />}
        {activeTab === 1 && <PaymentsTab onError={setError} />}
      </div>
    </div>
  )
}
