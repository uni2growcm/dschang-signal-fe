import { useRef, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  FormControl,
  MenuItem,
  Collapse,
  Select,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  SettingsOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { SettingsSection } from '../SharedSettingsComponents/SettingsSection';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../../services';
import { Formik, Form, type FormikProps } from 'formik';
import {
  generalValidationSchema,
  passwordValidationSchema,
} from './generalValidationSchema';

interface Notification {
  message: string;
  severity: 'success' | 'error';
}

export const GeneralSection = () => {
  const queryClient = useQueryClient();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [language, setLanguage] = useState('');
  const [timezone, setTimezone] = useState('');
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ message, severity });
  };

  const generalFormRef =
    useRef<FormikProps<{ email: string; fullName: string }>>(null);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userApi.getCurrentUser(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ email, fullName }: { email: string; fullName: string }) =>
      userApi.updateProfile({ updateProfileRequest: { email, fullName } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showNotification('Profile updated successfully', 'success');
    },
    onError: () => {
      showNotification('Failed to update profile. Please try again.', 'error');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) =>
      userApi.updatePassword({
        updatePasswordRequest: { currentPassword, newPassword },
      }),
    onSuccess: () => {
      showNotification('Password updated successfully', 'success');
    },
    onError: () => {
      showNotification(
        'Failed to update password. Please check your current password.',
        'error',
      );
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <SettingsSection
      icon={<SettingsOutlined />}
      title="General"
      description="Basic project information and configuration"
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

      <Stack spacing={2.5}>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            mb={0.5}
            display="block"
          >
            Project name
          </Typography>
          <TextField value="Dschang's Signal" size="small" disabled fullWidth />
        </Box>

        <Formik
          innerRef={generalFormRef}
          enableReinitialize
          initialValues={{
            email: currentUser?.email ?? '',
            fullName: currentUser?.fullName ?? '',
          }}
          validationSchema={generalValidationSchema}
          onSubmit={(values, { setSubmitting }) => {
            console.log('Update profile:', values);
            updateProfileMutation.mutate(
              { email: values.email, fullName: values.fullName },
              { onSettled: () => setSubmitting(false) },
            );
          }}
        >
          {({
            values,
            handleChange,
            handleBlur,
            errors,
            touched,
            dirty,
            isSubmitting,
          }) => {
            if (dirty !== isProfileDirty) setIsProfileDirty(dirty);
            return (
              <Form>
                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                >
                  <Box flex={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      mb={0.5}
                      display="block"
                    >
                      User email
                    </Typography>
                    <TextField
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      size="small"
                      fullWidth
                    />
                  </Box>
                  <Box flex={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      mb={0.5}
                      display="block"
                    >
                      Full name
                    </Typography>
                    <TextField
                      name="fullName"
                      value={values.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.fullName && Boolean(errors.fullName)}
                      helperText={touched.fullName && errors.fullName}
                      size="small"
                      fullWidth
                    />
                  </Box>
                </Box>
              </Form>
            );
          }}
        </Formik>

        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={passwordValidationSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            console.log('Update pasword', values);
            updatePasswordMutation.mutate(
              {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              },
              {
                onSuccess: () => {
                  resetForm();
                  setShowPasswordFields(false);
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                },
                onSettled: () => setSubmitting(false),
              },
            );
          }}
        >
          {({
            values,
            handleChange,
            handleBlur,
            errors,
            touched,
            isSubmitting,
            resetForm,
          }) => (
            <Form>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    mb={0.5}
                    display="block"
                  >
                    Password
                  </Typography>
                  <Box
                    display="flex"
                    gap={1}
                    alignItems="flex-start"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                  >
                    <Box flex={1} width="100%">
                      <TextField
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Current password"
                        value={values.currentPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.currentPassword &&
                          Boolean(errors.currentPassword)
                        }
                        helperText={
                          touched.currentPassword && errors.currentPassword
                        }
                        size="small"
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                sx={{ color: '#7C4DFF' }}
                                onClick={() =>
                                  setShowCurrentPassword((p) => !p)
                                }
                                edge="end"
                              >
                                {showCurrentPassword ? (
                                  <VisibilityOff fontSize="small" />
                                ) : (
                                  <Visibility fontSize="small" />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: '#7C4DFF',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#6C3FEF' },
                        whiteSpace: 'nowrap',
                        height: 40,
                        mt: { xs: 0, sm: '1px' },
                        width: { xs: '100%', sm: 'auto' },
                      }}
                      onClick={() => setShowPasswordFields(true)}
                      disabled={!values.currentPassword || showPasswordFields}
                    >
                      Update password
                    </Button>
                  </Box>
                </Box>

                <Collapse in={showPasswordFields}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        mb={0.5}
                        display="block"
                      >
                        New password
                      </Typography>
                      <TextField
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="New password"
                        value={values.newPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.newPassword && Boolean(errors.newPassword)
                        }
                        helperText={touched.newPassword && errors.newPassword}
                        size="small"
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                sx={{ color: '#7C4DFF' }}
                                onClick={() => setShowNewPassword((p) => !p)}
                                edge="end"
                              >
                                {showNewPassword ? (
                                  <VisibilityOff fontSize="small" />
                                ) : (
                                  <Visibility fontSize="small" />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        mb={0.5}
                        display="block"
                      >
                        Confirm new password
                      </Typography>
                      <TextField
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.confirmPassword &&
                          Boolean(errors.confirmPassword)
                        }
                        helperText={
                          touched.confirmPassword && errors.confirmPassword
                        }
                        size="small"
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                sx={{ color: '#7C4DFF' }}
                                onClick={() =>
                                  setShowConfirmPassword((p) => !p)
                                }
                                edge="end"
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOff fontSize="small" />
                                ) : (
                                  <Visibility fontSize="small" />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Box
                      display="flex"
                      justifyContent={{ xs: 'stretch', sm: 'flex-end' }}
                      flexDirection={{ xs: 'column-reverse', sm: 'row' }}
                      gap={1}
                      pt={1}
                    >
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          resetForm();
                          setShowPasswordFields(false);
                          setShowCurrentPassword(false);
                          setShowNewPassword(false);
                          setShowConfirmPassword(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={
                          isSubmitting ||
                          updatePasswordMutation.isPending ||
                          !values.newPassword ||
                          !values.confirmPassword ||
                          values.newPassword !== values.confirmPassword
                        }
                        startIcon={
                          updatePasswordMutation.isPending ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : null
                        }
                        sx={{
                          backgroundColor: '#7C4DFF',
                          '&:hover': { backgroundColor: '#6C3FEF' },
                        }}
                      >
                        {updatePasswordMutation.isPending
                          ? 'Saving...'
                          : 'Confirm'}
                      </Button>
                    </Box>
                  </Stack>
                </Collapse>
              </Stack>
            </Form>
          )}
        </Formik>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            mb={0.5}
            display="block"
          >
            Default language
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            mb={0.5}
            display="block"
          >
            Timezone
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="Africa/Douala">Africa/Douala (UTC+1)</MenuItem>
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="Europe/Paris">Europe/Paris (UTC+1)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={1} pt={1}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => generalFormRef.current?.resetForm()}
            disabled={showPasswordFields}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={
              updateProfileMutation.isPending ||
              showPasswordFields ||
              !isProfileDirty
            }
            startIcon={
              updateProfileMutation.isPending ? (
                <CircularProgress size={14} color="inherit" />
              ) : null
            }
            sx={{
              backgroundColor: '#7C4DFF',
              '&:hover': { backgroundColor: '#6C3FEF' },
            }}
            onClick={() => generalFormRef.current?.submitForm()}
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </Box>
      </Stack>
    </SettingsSection>
  );
};
