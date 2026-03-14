import { Box, Typography, Switch } from '@mui/material'

export const SwitchRow = ({
  label,
  description,
  defaultChecked = false,
}: {
  label: string
  description: string
  defaultChecked?: boolean
}) => (
  <Box
    display='flex'
    justifyContent='space-between'
    alignItems='center'
    py={0.5}
  >
    <Box>
      <Typography variant='body2' fontWeight='medium'>
        {label}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        {description}
      </Typography>
    </Box>
    <Switch
      defaultChecked={defaultChecked}
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': {
          color: '#9A5ACD',
          '& + .MuiSwitch-track': {
            backgroundColor: '#9A5ACD',
          },
        },
      }}
    />
  </Box>
)
