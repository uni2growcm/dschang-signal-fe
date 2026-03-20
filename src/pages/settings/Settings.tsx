import { GeneralSection } from '../../components/settings/contentSettings/GeneralSection';
import { ModerationSection } from '../../components/settings/contentSettings/ModerationSection';
import { PrivacySection } from '../../components/settings/contentSettings/PrivacySection';
import { DangerZoneSection } from '../../components/settings/contentSettings/DangerZoneSection';
import {
  Box,
  Typography,
  Stack,
  Toolbar,
  CircularProgress,
} from '@mui/material';
import TopNavBar from '../../components/topNavBar/TopNavBar';
import { UsersSection } from '../../components/settings/contentSettings/UserSection';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../services';

export const Settings = () => {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userApi.getCurrentUser(),
  });

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <>
      <TopNavBar />
      <Toolbar />

      <Box
        sx={{
          backgroundColor: '#FAFAFA',
          minHeight: '100vh',
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box maxWidth={750} mx="auto">
          <Box mb={4} textAlign="center">
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              fontSize={{ xs: '1.3rem', sm: '1.5rem' }}
            >
              Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your project configuration and preferences
            </Typography>
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack spacing={3}>
              <GeneralSection />

              {isAdmin && (
                <>
                  <UsersSection />
                  <ModerationSection />
                  <PrivacySection />
                </>
              )}

              <DangerZoneSection />
            </Stack>
          )}
        </Box>
      </Box>
    </>
  );
};
