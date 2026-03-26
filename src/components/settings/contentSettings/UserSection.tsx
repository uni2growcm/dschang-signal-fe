import { PeopleOutlined, SearchOutlined } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChangeRoleRequestRoleEnum } from "../../../api/models/ChangeRoleRequest";
import { userApi } from "../../../services";
import { getAllUsersPaginated } from "../../../utils/usersApiExtended";
import { SettingsSection } from "../SharedSettingsComponents/SettingsSection";

interface Notification {
  message: string;
  severity: "success" | "error";
}

const PAGE_SIZE = 3;
const ALL_USERS_SIZE = 10000;

export const UsersSection = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const showNotification = (message: string, severity: "success" | "error") => {
    setNotification({ message, severity });
  };

  const { data: paginatedData, isLoading: isPaginatedLoading } = useQuery({
    queryKey: ["users", page],
    queryFn: () =>
      getAllUsersPaginated({
        page: page - 1,
        size: PAGE_SIZE,
        sort: "fullName",
      }),
    enabled: !search,
  });

  const { data: allData, isLoading: isAllLoading } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () =>
      getAllUsersPaginated({
        page: 0,
        size: ALL_USERS_SIZE,
        sort: "fullName",
      }),
    enabled: !!search,
  });

  const isLoading = isPaginatedLoading || isAllLoading;

  const users = search ? (allData?.users ?? []) : (paginatedData?.users ?? []);
  const totalPages = search ? 0 : (paginatedData?.totalPages ?? 0);

  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: number;
      role: ChangeRoleRequestRoleEnum;
    }) =>
      userApi.changeUserRole({
        id: userId,
        changeRoleRequest: { role },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", page] });
      showNotification(t("usersSection.roleUpdated"), "success");
    },
    onError: () => {
      showNotification(t("usersSection.roleUpdateError"), "error");
    },
  });

  const filteredUsers = search
    ? users.filter((user: any) =>
        user.fullName?.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <SettingsSection
      icon={<PeopleOutlined />}
      title={t("usersSection.title")}
      description={t("usersSection.description")}
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

      <TextField
        placeholder={t("usersSection.searchPlaceholder")}
        size="small"
        fullWidth
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined
                fontSize="small"
                sx={{ color: "text.secondary" }}
              />
            </InputAdornment>
          ),
        }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress size={24} />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={3}
        >
          {t("usersSection.noUser")}
        </Typography>
      ) : (
        <Stack spacing={0}>
          {filteredUsers.map((user: any, index: number) => (
            <Box key={user.id}>
              <Box
                display="flex"
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                py={1.5}
                gap={1.5}
                flexDirection={{ xs: "column", sm: "row" }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                  flex={1}
                  minWidth={0}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "primary.main",
                      fontSize: 13,
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    {user.fullName
                      ?.split(" ")
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Avatar>
                  <Box minWidth={0}>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {user.fullName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: { xs: "200px", sm: "100%" },
                      }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  flexShrink={0}
                  width={{ xs: "100%", sm: "auto" }}
                  justifyContent={{ xs: "space-between", sm: "flex-end" }}
                >
                  <Chip
                    label={user.isActive ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      bgcolor: user.isActive
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(158, 158, 158, 0.1)",
                      color: user.isActive ? "success.main" : "text.secondary",
                      fontWeight: "medium",
                      fontSize: 11,
                    }}
                  />

                  <FormControl
                    size="small"
                    sx={{ minWidth: { xs: 120, sm: 110 } }}
                  >
                    <Select
                      value={user.role ?? "CITIZEN"}
                      disabled={updateRoleMutation.isPending}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          userId: user.id,
                          role: e.target.value as ChangeRoleRequestRoleEnum,
                        })
                      }
                      sx={{
                        fontSize: 12,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "divider",
                        },
                      }}
                    >
                      <MenuItem value="CITIZEN">
                        <Typography variant="caption">CITIZEN</Typography>
                      </MenuItem>
                      <MenuItem value="ADMIN">
                        <Typography variant="caption">ADMIN</Typography>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {index < filteredUsers.length - 1 && (
                <Box
                  sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                />
              )}
            </Box>
          ))}
        </Stack>
      )}

      {!isLoading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" pt={2}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={(_, value) => setPage(value)}
            size="small"
            color="primary"
            siblingCount={0}
          />
        </Box>
      )}
    </SettingsSection>
  );
};
