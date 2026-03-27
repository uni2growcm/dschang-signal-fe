import { SettingsSection } from "../SharedSettingsComponents/SettingsSection";
import {
  Box,
  Button,
  Typography,
  Divider,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import { WarningAmberOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Notification {
  message: string;
  severity: "warning" | "info" | "error";
}

export const DangerZoneSection = () => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const { t } = useTranslation();
  return (
    <SettingsSection
      icon={<WarningAmberOutlined color="error" />}
      title={t("settings.danger.title")}
      description={t("settings.danger.description")}
      danger
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

      <Stack spacing={2}>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={1.5}
        >
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {t("settings.danger.resetSignals.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("settings.danger.resetSignals.description")}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            sx={{ flexShrink: 0 }}
            onClick={() =>
              setNotification({
                message: t("settings.danger.notifications.notDeveloped"),
                severity: "info",
              })
            }
          >
            {t("settings.danger.resetSignals.button")}
          </Button>
        </Box>

        <Divider sx={{ borderColor: "error.light" }} />

        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={1.5}
        >
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {t("settings.danger.deleteProject.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("settings.danger.deleteProject.description")}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            sx={{ flexShrink: 0 }}
            onClick={() =>
              setNotification({
                message: t("settings.danger.notifications.notAuthorized"),
                severity: "warning",
              })
            }
          >
            {t("settings.danger.deleteProject.button")}
          </Button>
        </Box>
      </Stack>
    </SettingsSection>
  );
};
