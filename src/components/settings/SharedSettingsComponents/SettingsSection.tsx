import { Box, Typography, Paper } from '@mui/material'

interface SettingsSectionProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  danger?: boolean
}

export const SettingsSection = ({
  icon,
  title,
  description,
  children,
  danger,
}: SettingsSectionProps) => {
  return (
    <Paper
      variant='outlined'
      sx={{
        p: 3,
        borderColor: danger ? 'error.main' : 'divider',
        borderRadius: 2,
      }}
    >
      <Box display='flex' alignItems='flex-start' gap={2} mb={3}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            bgcolor: danger ? 'error.50' : 'grey.100',
            display: 'flex',
            color: danger ? 'error.main' : 'text.secondary',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant='h6'
            fontWeight='semibold'
            color={danger ? 'error.main' : 'text.primary'}
          >
            {title}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {description}
          </Typography>
        </Box>
      </Box>
      {children}
    </Paper>
  )
}
