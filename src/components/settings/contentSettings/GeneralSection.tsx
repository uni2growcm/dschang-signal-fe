import { useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Collapse,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  SettingsOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { SettingsSection } from "../SharedSettingsComponents/SettingsSection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../../services";
import { Formik, Form, type FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import {
  generalValidationSchema,
  passwordValidationSchema,
} from "./generalValidationSchema";

interface Notification {
  message: string;
  severity: "success" | "error";
}

export const GeneralSection = () => {
  const queryClient = useQueryClient();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const { t } = useTranslation();
  const showNotification = (message: string, severity: "success" | "error") => {
    setNotification({ message, severity });
  };

  const generalFormRef =
    useRef<FormikProps<{ email: string; fullName: string }>>(null);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => userApi.getCurrentUser(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ email, fullName }: { email: string; fullName: string }) =>
      userApi.updateProfile({ updateProfileRequest: { email, fullName } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      showNotification(
        t("settings.general.notifications.updateSuccess"),
        "success",
      );
    },
    onError: () => {
      showNotification(
        t("settings.general.notifications.updateError"),
        "error",
      );
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
      showNotification(
        t("settings.general.notifications.passwordSuccess"),
        "success",
      );
    },
    onError: () => {
      showNotification(
        t("settings.general.notifications.passwordError"),
        "error",
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
      title={t("settings.general.title")}
      description={t("settings.general.description")}
    >
      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.severity}
          variant="filled"
          sx={{ width: "100%" }}
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
            {t("settings.general.projectName")}
          </Typography>
          <TextField value="Dschang's Signal" size="small" disabled fullWidth />
        </Box>

        <Formik
          innerRef={generalFormRef}
          enableReinitialize
          initialValues={{
            email: currentUser?.email ?? "",
            fullName: currentUser?.fullName ?? "",
          }}
          validationSchema={generalValidationSchema}
          onSubmit={(values, { setSubmitting }) => {
            console.log("Update profile:", values);
            updateProfileMutation.mutate(
              { email: values.email, fullName: values.fullName },
              { onSettled: () => setSubmitting(false) },
            );
          }}
        >
          {({ values, handleChange, handleBlur, errors, touched, dirty }) => {
            if (dirty !== isProfileDirty) setIsProfileDirty(dirty);
            return (
              <Form>
                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <Box flex={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      mb={0.5}
                      display="block"
                    >
                      {t("settings.general.userEmail")}
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
                      {t("settings.general.fullName")}
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
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={passwordValidationSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            console.log("Update pasword", values);
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
                    {t("settings.general.password")}
                  </Typography>
                  <Box
                    display="flex"
                    gap={1}
                    alignItems="flex-start"
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <Box flex={1} width="100%">
                      <TextField
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder={t(
                          "settings.general.placeholders.currentPassword",
                        )}
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
                                sx={{ color: "#7C4DFF" }}
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
                        backgroundColor: "#7C4DFF",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#6C3FEF" },
                        whiteSpace: "nowrap",
                        height: 40,
                        mt: { xs: 0, sm: "1px" },
                        width: { xs: "100%", sm: "auto" },
                      }}
                      onClick={() => setShowPasswordFields(true)}
                      disabled={!values.currentPassword || showPasswordFields}
                    >
                      {t("settings.general.buttons.updatePassword")}
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
                        type={showNewPassword ? "text" : "password"}
                        placeholder={t(
                          "settings.general.placeholders.newPassword",
                        )}
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
                                sx={{ color: "#7C4DFF" }}
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
                        {t("settings.general.buttons.confirm")}
                      </Typography>
                      <TextField
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t(
                          "settings.general.placeholders.confirmPassword",
                        )}
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
                                sx={{ color: "#7C4DFF" }}
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
                      justifyContent={{ xs: "stretch", sm: "flex-end" }}
                      flexDirection={{ xs: "column-reverse", sm: "row" }}
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
                        {t("settings.general.buttons.saveChanges")}
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
                          values.newPassword !== values.confirmPassword ||
                          values.currentPassword.length < 6 ||
                          values.currentPassword === values.newPassword
                        }
                        startIcon={
                          updatePasswordMutation.isPending ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : null
                        }
                        sx={{
                          backgroundColor: "#7C4DFF",
                          "&:hover": { backgroundColor: "#6C3FEF" },
                        }}
                      >
                        {updatePasswordMutation.isPending
                          ? t("settings.general.buttons.saving")
                          : t("settings.general.buttons.confirm")}
                      </Button>
                    </Box>
                  </Stack>
                </Collapse>
              </Stack>
            </Form>
          )}
        </Formik>

        {!showPasswordFields && (
          <Box display="flex" justifyContent="flex-end" gap={1} pt={1}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => generalFormRef.current?.resetForm()}
            >
              {t("settings.general.buttons.cancel")}
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={updateProfileMutation.isPending || !isProfileDirty}
              startIcon={
                updateProfileMutation.isPending ? (
                  <CircularProgress size={14} color="inherit" />
                ) : null
              }
              sx={{
                backgroundColor: "#7C4DFF",
                "&:hover": { backgroundColor: "#6C3FEF" },
              }}
              onClick={() => generalFormRef.current?.submitForm()}
            >
              {updateProfileMutation.isPending
                ? t("settings.general.buttons.saving")
                : t("settings.general.buttons.saveChanges")}
            </Button>
          </Box>
        )}
      </Stack>
    </SettingsSection>
  );
};
