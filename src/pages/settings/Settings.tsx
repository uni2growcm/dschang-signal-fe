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
import { UsersSection } from '../../components/settings/contentSettings/UserSection';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../services';
import { Link } from 'react-router-dom';
import { PATHS } from '../../routes/PATHS';
import Header from '../../components/header/Header';

export const Settings = () => {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userApi.getCurrentUser(),
  });

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <>
      <Header />
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
          <Link
            to={PATHS.INDEX}
            className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all w-fit"
          >
            ← Back to Home
          </Link>
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
