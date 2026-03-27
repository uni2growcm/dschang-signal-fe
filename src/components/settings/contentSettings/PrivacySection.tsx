import { useState } from 'react'
import { SettingsSection } from '../SharedSettingsComponents/SettingsSection'
import { SwitchRow } from '../SharedSettingsComponents/SwitchRow'
import { Box, TextField, Typography, Divider, Stack } from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

export const PrivacySection = () => {
  const {t} = useTranslation();
  const [sessionTimeout, setSessionTimeout] = useState('30')

  return (
    <SettingsSection
      icon={<LockOutlined />}
      title={t('settings.privacy.title')}
      description={t('settings.privacy.description')}
    >
      <Stack divider={<Divider />} spacing={0}>
        <SwitchRow
          label={t('settings.privacy.public-feed')}
          description={t('settings.privacy.allow-anyone-to-view-the-signal-feed-without-logging-in')}
        />
        <SwitchRow
          label={t('settings.privacy.anonymous-reporting')}
          description={t('settings.privacy.allow-users-to-submit-signals-without-revealing-their-identity')}
          defaultChecked
        />
        <SwitchRow
          label={t('settings.privacy.two-factor-authentication')}
          description={t('settings.privacy.require-2fa-for-admin-accounts')}
        />

        <Box py={2}>
          <Typography variant='body2' fontWeight='medium' mb={0.5}>
            {t('settings.privacy.session-timeout-minutes')}
          </Typography>
          <TextField
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            type='number'
            size='small'
            sx={{ width: 100 }}
          />
          <Typography
            variant='caption'
            color='text.secondary'
            display='block'
            mt={0.5}
          >
            {t('settings.privacy.automatically-log-out-inactive-users-after-this-duration')}
          </Typography>
        </Box>
      </Stack>
    </SettingsSection>
  )
}
