import {
  Box,
  CircularProgress,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { DangerZoneSection } from "../../components/settings/contentSettings/DangerZoneSection";
import { GeneralSection } from "../../components/settings/contentSettings/GeneralSection";
import { ModerationSection } from "../../components/settings/contentSettings/ModerationSection";
import { PrivacySection } from "../../components/settings/contentSettings/PrivacySection";
import { UsersSection } from "../../components/settings/contentSettings/UserSection";
import { PATHS } from "../../routes/PATHS";
import { userApi } from "../../services";

export const Settings = () => {
  const { t } = useTranslation();
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => userApi.getCurrentUser(),
  });

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <>
      <Toolbar />

      <Box
        sx={{
          backgroundColor: "#FAFAFA",
          minHeight: "100vh",
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box maxWidth={750} mx="auto">
          <Link
            to={PATHS.INDEX}
            className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all w-fit"
          >
            {t("settings.backHome")}
          </Link>
          <Box mb={4} textAlign="center">
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              fontSize={{ xs: "1.3rem", sm: "1.5rem" }}
            >
              {t("settings.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("settings.description")}
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
