import { useState } from 'react'
import {
  Box,
  TextField,
  Typography,
  Divider,
  Stack,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  Checkbox,
} from '@mui/material'
import { GavelOutlined } from '@mui/icons-material'
import { SettingsSection } from '../SharedSettingsComponents/SettingsSection'

export const ModerationSection = () => {
  const [approvalMode, setApprovalMode] = useState('manual')
  const [maxSignals, setMaxSignals] = useState('10')
  const [filters, setFilters] = useState({
    profanity: true,
    spam: true,
    imageRequired: false,
    locationTagging: false,
  })

  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <SettingsSection
      icon={<GavelOutlined />}
      title='Moderation'
      description='Configure content moderation and approval rules'
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant='body2' fontWeight='medium' mb={1}>
            Post approval mode
          </Typography>
          <FormControl>
            <RadioGroup
              value={approvalMode}
              onChange={(e) => setApprovalMode(e.target.value)}
            >
              <FormControlLabel
                value='manual'
                control={
                  <Radio
                    size='small'
                    sx={{
                      '&.Mui-checked': {
                        color: '#9A5ACD',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant='body2'>
                    Manual approval required
                  </Typography>
                }
              />
              <FormControlLabel
                value='auto'
                control={
                  <Radio
                    size='small'
                    sx={{
                      '&.Mui-checked': {
                        color: '#9A5ACD',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant='body2'>
                    Auto approve all posts
                  </Typography>
                }
              />
              <FormControlLabel
                value='verified'
                control={
                  <Radio
                    size='small'
                    sx={{
                      '&.Mui-checked': {
                        color: '#9A5ACD',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant='body2'>
                    Auto-approve for verified users only
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider />

        <Box>
          <Typography variant='body2' fontWeight='medium' mb={1}>
            Content filters
          </Typography>
          <Stack>
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  sx={{
                    '&.Mui-checked': {
                      color: '#9A5ACD',
                    },
                  }}
                  checked={filters.profanity}
                  onChange={() => handleFilterChange('profanity')}
                />
              }
              label={
                <Typography variant='body2'>
                  Filter profanity and offensive language
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  sx={{
                    '&.Mui-checked': {
                      color: '#9A5ACD',
                    },
                  }}
                  checked={filters.spam}
                  onChange={() => handleFilterChange('spam')}
                />
              }
              label={
                <Typography variant='body2'>
                  Block spam and repeated submissions
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  sx={{
                    '&.Mui-checked': {
                      color: '#9A5ACD',
                    },
                  }}
                  checked={filters.imageRequired}
                  onChange={() => handleFilterChange('imageRequired')}
                />
              }
              label={
                <Typography variant='body2'>
                  Require image attachments for reports
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  sx={{
                    '&.Mui-checked': {
                      color: '#9A5ACD',
                    },
                  }}
                  checked={filters.locationTagging}
                  onChange={() => handleFilterChange('locationTagging')}
                />
              }
              label={
                <Typography variant='body2'>Enable location tagging</Typography>
              }
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant='body2' fontWeight='medium' mb={1}>
            Max signals per user per day
          </Typography>
          <TextField
            value={maxSignals}
            onChange={(e) => setMaxSignals(e.target.value)}
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
            Set to 0 for unlimited
          </Typography>
        </Box>
      </Stack>
    </SettingsSection>
  )
}
