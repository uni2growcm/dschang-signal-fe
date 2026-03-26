import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Chip,
  Badge,
} from '@mui/material';
import { NotificationsOutlined } from '@mui/icons-material';
import Logo from '../logo/Logo';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../services';

const UNREAD_NOTIFICATIONS = 3;

export default function TopNavBar() {

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userApi.getCurrentUser(),
  });

  const fullName = currentUser?.fullName ?? '';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 } }}>
        <Logo hideText={false} />

        <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Chip
              avatar={
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    fontSize: 40,
                    fontWeight: 'bold',
                  }}
                >
                  {initials}
                </Avatar>
              }
              label={fullName || '...'}
              size="medium"
              sx={{
                bgcolor: 'rgba(103, 58, 183, 0.08)',
                color: 'text.primary',
                fontWeight: 'bold',
                fontSize: 18,
                border: '1px solid',
                borderColor: 'divider',
                height: 32,
                '& .MuiChip-avatar': {
                  marginLeft: '0',
                  width: 32,
                  height: 32,
                  fontSize: 22,
                  fontWeight: 'bold',
                  bgcolor: 'primary.main',
                  color: 'white',
                },
              }}
            />
          </Box>

          <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: 13,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {initials}
            </Avatar>
          </Box>

          <IconButton size="small">
            <Badge badgeContent={UNREAD_NOTIFICATIONS} color="error">
              <NotificationsOutlined sx={{ color: 'text.secondary' }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
