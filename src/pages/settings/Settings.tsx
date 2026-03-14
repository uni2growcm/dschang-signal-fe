import { GeneralSection } from '../../components/settings/contentSettings/GeneralSection'
import { NotificationsSection } from '../../components/settings/contentSettings/NotificationsSection'
import { ModerationSection } from '../../components/settings/contentSettings/ModerationSection'
import { PrivacySection } from '../../components/settings/contentSettings/PrivacySection'
import { DangerZoneSection } from '../../components/settings/contentSettings/DangerZoneSection'
import { Box, Typography, Stack } from '@mui/material'

export const Settings = () => {
  return (
    <Box p={4}>
      <Box mb={4}>
        <Typography variant='h5' fontWeight='bold' gutterBottom>
          Settings
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Manage your project configuration and preferences
        </Typography>
      </Box>

      <Stack spacing={3} maxWidth={700}>
        <GeneralSection />
        <NotificationsSection />
        <ModerationSection />
        <PrivacySection />
        <DangerZoneSection />
      </Stack>
    </Box>
  )
}
