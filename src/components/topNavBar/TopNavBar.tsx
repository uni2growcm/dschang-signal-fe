import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Chip,
  Badge,
} from '@mui/material'
import { NotificationsOutlined, SettingsOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router'
import Logo from '../logo/Logo'



const mockUser = {
  fullName: 'Rivaldo SN',
  avatarUrl: null as string | null,
}

const UNREAD_NOTIFICATIONS = 3

export default function TopNavBar() {
  const navigate = useNavigate()

  // Initiales de l'avatar à partir du nom
  const initials = mockUser.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <AppBar
      position='fixed'
      elevation={0}
      sx={{
        bgcolor: '#ffff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>

       
        <Logo hideText={false} />

       
<Box display='flex' alignItems='center' gap={1}>

        <Chip
        avatar={
            <Avatar
            src={mockUser.avatarUrl ?? undefined}
            sx={{
                bgcolor: 'primary.main',
                fontSize: 13,
                fontWeight: 'bold',
            }}
            >
            {!mockUser.avatarUrl && initials}
            </Avatar>
        }
        label={mockUser.fullName}
        size='medium'
        sx={{
            bgcolor: 'rgba(103, 58, 183, 0.08)',
            color: 'text.primary',
            fontWeight: 'bold',
            fontSize: 12,
            border: '1px',
            borderColor: 'divider',
            width: 118,
            height: 32,                        
            '& .MuiChip-avatar': {
            width: 32,                       
            height: 32,                      
            fontSize: 13,
            fontWeight: 'bold',
            bgcolor: 'primary.main',
            color: 'white',
            },
        }}
        />

  <IconButton size='small'>
    <Badge badgeContent={UNREAD_NOTIFICATIONS} color='error'>
      <NotificationsOutlined sx={{ color: 'text.secondary' }} />
    </Badge>
  </IconButton>

  <IconButton size='small' onClick={() => navigate('/settings')}>
    <SettingsOutlined sx={{ color: 'text.secondary' }} />
  </IconButton>

</Box>
      </Toolbar>
    </AppBar>
  )
}