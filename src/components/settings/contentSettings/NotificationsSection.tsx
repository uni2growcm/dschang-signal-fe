import { Divider, Stack } from '@mui/material'
import { NotificationsOutlined } from '@mui/icons-material'
import { SettingsSection } from '../SharedSettingsComponents/SettingsSection'
import { SwitchRow } from '../SharedSettingsComponents/SwitchRow'

export const NotificationsSection = () => {
  return (
    <SettingsSection
      icon={<NotificationsOutlined />}
      title='Notifications'
      description='Choose what notifications you want to receive'
    >
      <Stack divider={<Divider />}>
        <SwitchRow
          label='Email notifications'
          description='Receive email alerts for new signals'
          defaultChecked
        />
        <SwitchRow
          label='Push notifications'
          description='Get push notifications on your device'
          defaultChecked
        />
        <SwitchRow
          label='Weekly digest'
          description='Receive a weekly summary of all activity'
        />
        <SwitchRow
          label='Status change alerts'
          description='Notify when a signal status is updated'
          defaultChecked
        />
      </Stack>
    </SettingsSection>
  )
}
