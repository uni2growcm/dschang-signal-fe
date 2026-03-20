import { SettingsSection } from '../SharedSettingsComponents/SettingsSection';
import {
  Box,
  Button,
  Typography,
  Divider,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import { WarningAmberOutlined } from '@mui/icons-material';
import { useState } from 'react';

interface Notification {
  message: string;
  severity: 'warning' | 'info' | 'error';
}

export const DangerZoneSection = () => {
  const [notification, setNotification] = useState<Notification | null>(null);
  return (
    <SettingsSection
      icon={<WarningAmberOutlined color="error" />}
      title="Danger Zone"
      description="Irreversible actions — proceed with caution"
      danger
    >
      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>

      <Stack spacing={2}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1.5}
        >
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Reset all signals
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Permanently delete all signals and associated data
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            sx={{ flexShrink: 0 }}
            onClick={() =>
              setNotification({
                message: 'This feature has not been developed yet.',
                severity: 'info',
              })
            }
          >
            Reset data
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'error.light' }} />

        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1.5}
        >
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Delete project
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Permanently remove this project and all its data
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            sx={{ flexShrink: 0 }}
            onClick={() =>
              setNotification({
                message: 'This action is not authorized.',
                severity: 'warning',
              })
            }
          >
            Delete project
          </Button>
        </Box>
      </Stack>
    </SettingsSection>
  );
};
