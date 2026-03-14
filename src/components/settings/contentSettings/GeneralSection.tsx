import { useState } from 'react'

import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  FormControl,
  MenuItem,
  Select,
} from '@mui/material'
import { SettingsOutlined } from '@mui/icons-material'
import { SettingsSection } from '../SharedSettingsComponents/SettingsSection'

export const GeneralSection = () => {
  const [projectName, setProjectName] = useState("Dschang's Signal")
  const [adminEmail, setAdminEmail] = useState('rivaldo@dschang-signal.org')
  const [supportEmail, setSupportEmail] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('')
  const [timezone, setTimezone] = useState('')

  return (
    <SettingsSection
      icon={<SettingsOutlined />}
      title='General'
      description='Basic project information and configuration'
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography
            variant='caption'
            color='text.secondary'
            mb={0.5}
            display='block'
          >
            Project name
          </Typography>
          <TextField
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            size='small'
            fullWidth
          />
        </Box>

        <Box display='flex' gap={2}>
          <Box flex={1}>
            <Typography
              variant='caption'
              color='text.secondary'
              mb={0.5}
              display='block'
            >
              Admin email
            </Typography>
            <TextField
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              size='small'
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <Typography
              variant='caption'
              color='text.secondary'
              mb={0.5}
              display='block'
            >
              Support email
            </Typography>
            <TextField
              placeholder='support@example.com'
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              size='small'
              fullWidth
            />
          </Box>
        </Box>

        <Box>
          <Typography
            variant='caption'
            color='text.secondary'
            mb={0.5}
            display='block'
          >
            Project description
          </Typography>
          <TextField
            placeholder='Describe your project...'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
            size='small'
          />
        </Box>

        <Box>
          <Typography
            variant='caption'
            color='text.secondary'
            mb={0.5}
            display='block'
          >
            Default language
          </Typography>
          <FormControl fullWidth size='small'>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              displayEmpty
            >
              <MenuItem value=''>—</MenuItem>
              <MenuItem value='fr'>Français</MenuItem>
              <MenuItem value='en'>English</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography
            variant='caption'
            color='text.secondary'
            mb={0.5}
            display='block'
          >
            Timezone
          </Typography>
          <FormControl fullWidth size='small'>
            <Select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              displayEmpty
            >
              <MenuItem value=''>—</MenuItem>
              <MenuItem value='Africa/Douala'>Africa/Douala (UTC+1)</MenuItem>
              <MenuItem value='UTC'>UTC</MenuItem>
              <MenuItem value='Europe/Paris'>Europe/Paris (UTC+1)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box display='flex' justifyContent='flex-end' gap={1} pt={1}>
          <Button variant='outlined' color='inherit' size='small'>
            Cancel
          </Button>

          <Button
            variant='contained'
            sx={{
              backgroundColor: '#9A5ACD',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#7A4ACD',
              },
            }}
            size='small'
          >
            Save changes
          </Button>
        </Box>
      </Stack>
    </SettingsSection>
  )
}
