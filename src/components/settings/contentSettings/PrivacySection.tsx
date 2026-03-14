import { useState } from 'react'
import { SettingsSection } from '../SharedSettingsComponents/SettingsSection'
import { SwitchRow } from '../SharedSettingsComponents/SwitchRow'
import { Box, TextField, Typography, Divider, Stack } from '@mui/material'
import { LockOutlined } from '@mui/icons-material'

export const PrivacySection = () => {
  const [sessionTimeout, setSessionTimeout] = useState('30')

  return (
    <SettingsSection
      icon={<LockOutlined />}
      title='Privacy & Security'
      description='Control data visibility and access settings'
    >
      <Stack divider={<Divider />} spacing={0}>
        <SwitchRow
          label='Public feed'
          description='Allow anyone to view the signal feed without logging in'
        />
        <SwitchRow
          label='Anonymous reporting'
          description='Allow users to submit signals without revealing their identity'
          defaultChecked
        />
        <SwitchRow
          label='Two-factor authentication'
          description='Require 2FA for admin accounts'
        />

        <Box py={2}>
          <Typography variant='body2' fontWeight='medium' mb={0.5}>
            Session timeout (minutes)
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
            Automatically log out inactive users after this duration
          </Typography>
        </Box>
      </Stack>
    </SettingsSection>
  )
}
