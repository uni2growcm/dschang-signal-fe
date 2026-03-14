import { SettingsSection } from '../SharedSettingsComponents/SettingsSection'
import { Box, Button, Typography, Divider, Stack } from '@mui/material'
import { WarningAmberOutlined } from '@mui/icons-material'

export const DangerZoneSection = () => {
  return (
    <SettingsSection
      icon={<WarningAmberOutlined color='error' />}
      title='Danger Zone'
      description='Irreversible actions — proceed with caution'
      danger
    >
      <Stack spacing={2}>
        <Box
          display='flex'
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1.5}
        >
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              Reset all signals
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Permanently delete all signals and associated data
            </Typography>
          </Box>
          <Button
            variant='outlined'
            color='error'
            size='small'
            sx={{ flexShrink: 0 }}
          >
            Reset data
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'error.light' }} />

        <Box
          display='flex'
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1.5}
        >
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              Delete project
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Permanently remove this project and all its data
            </Typography>
          </Box>
          <Button
            variant='outlined'
            color='error'
            size='small'
            sx={{ flexShrink: 0 }}
          >
            Delete project
          </Button>
        </Box>
      </Stack>
    </SettingsSection>
  )
}