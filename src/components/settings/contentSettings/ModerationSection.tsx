import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Divider,
  Stack,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  Checkbox,
} from "@mui/material";
import { GavelOutlined } from "@mui/icons-material";
import { SettingsSection } from "../SharedSettingsComponents/SettingsSection";
import { useTranslation } from "react-i18next";

export const ModerationSection = () => {
  const [approvalMode, setApprovalMode] = useState("manual");
  const [maxSignals, setMaxSignals] = useState("10");
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    profanity: true,
    spam: true,
    imageRequired: false,
    locationTagging: false,
  });

  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SettingsSection
      icon={<GavelOutlined />}
      title={t("settings.moderation.title")}
      description={t("settings.moderation.description")}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="body2" fontWeight="medium" mb={1}>
            {t("settings.moderation.approvalMode.title")}
          </Typography>
          <FormControl>
            <RadioGroup
              value={approvalMode}
              onChange={(e) => setApprovalMode(e.target.value)}
            >
              <FormControlLabel
                value="manual"
                control={
                  <Radio
                    size="small"
                    sx={{
                      "&.Mui-checked": {
                        color: "#7C4DFF",
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("settings.moderation.approvalMode.manual")}
                  </Typography>
                }
              />
              <FormControlLabel
                value="auto"
                control={
                  <Radio
                    size="small"
                    sx={{
                      "&.Mui-checked": {
                        color: "#7C4DFF",
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("settings.moderation.approvalMode.auto")}
                  </Typography>
                }
              />
              <FormControlLabel
                value="verified"
                control={
                  <Radio
                    size="small"
                    sx={{
                      "&.Mui-checked": {
                        color: "#7C4DFF",
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("settings.moderation.approvalMode.verified")}
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider />

        <Box>
          <Typography variant="body2" fontWeight="medium" mb={1}>
            {t("settings.moderation.filters.title")}
          </Typography>
          <Stack>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  sx={{
                    "&.Mui-checked": {
                      color: "#7C4DFF",
                    },
                  }}
                  checked={filters.profanity}
                  onChange={() => handleFilterChange("profanity")}
                />
              }
              label={
                <Typography variant="body2">
                  {t("settings.moderation.filters.profanity")}
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  sx={{
                    "&.Mui-checked": {
                      color: "#7C4DFF",
                    },
                  }}
                  checked={filters.spam}
                  onChange={() => handleFilterChange("spam")}
                />
              }
              label={
                <Typography variant="body2">
                  {t("settings.moderation.filters.spam")}
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  sx={{
                    "&.Mui-checked": {
                      color: "#7C4DFF",
                    },
                  }}
                  checked={filters.imageRequired}
                  onChange={() => handleFilterChange("imageRequired")}
                />
              }
              label={
                <Typography variant="body2">
                  {t("settings.moderation.filters.imageRequired")}
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  sx={{
                    "&.Mui-checked": {
                      color: "#7C4DFF",
                    },
                  }}
                  checked={filters.locationTagging}
                  onChange={() => handleFilterChange("locationTagging")}
                />
              }
              label={
                <Typography variant="body2">
                  {t("settings.moderation.filters.location")}
                </Typography>
              }
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="body2" fontWeight="medium" mb={1}>
            {t("settings.moderation.maxSignals.title")}
          </Typography>
          <TextField
            value={maxSignals}
            onChange={(e) => setMaxSignals(e.target.value)}
            type="number"
            size="small"
            sx={{ width: 100 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={0.5}
          >
            {t("settings.moderation.maxSignals.helper")}
          </Typography>
        </Box>
      </Stack>
    </SettingsSection>
  );
};
