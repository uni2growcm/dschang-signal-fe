import { Divider, Stack } from '@mui/material'
import { NotificationsOutlined } from '@mui/icons-material'
import { SettingsSection } from '../SharedSettingsComponents/SettingsSection'
import { SwitchRow } from '../SharedSettingsComponents/SwitchRow'
import { useTranslation } from 'react-i18next'

export const NotificationsSection = () => {
  const {t} = useTranslation();
  return (
    <SettingsSection
      icon={<NotificationsOutlined />}
      title={t('settings.notifications.title')}
      description={t('settings.notifications.choose-what-notifications-to-receive')}
    >
      <Stack divider={<Divider />}>
        <SwitchRow
          label={t('settings.notifications.email-notifications')}
          description={t('settings.notifications.receive-email-alerts-for-new-signals')}
          defaultChecked
        />
        <SwitchRow
          label={t('settings.notifications.push-notifications')}
          description={t('settings.notifications.get-push-notifications')}
          defaultChecked
        />
        <SwitchRow
          label={t('settings.notifications.weekly-digest')}
          description={t('settings.notifications.receive-weekly-summary')}
        />
        <SwitchRow
          label={t('settings.notifications.status-change-alerts')}
          description={t('settings.notifications.notify-when-a-signal-status-is-updated')}
          defaultChecked
        />
      </Stack>
    </SettingsSection>
  )
}
