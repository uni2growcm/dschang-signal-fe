import {
  Avatar,
  Badge,
  Backdrop,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  useMutation,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosNotificationsOutline, IoMdSettings } from "react-icons/io";
import { MdClose, MdLogout, MdMenu } from "react-icons/md";
import { Link, useNavigate } from "react-router";
import { useNotificationCenter } from "../../contexts/NotificationCenter";
import { PATHS } from "../../routes/PATHS";
import { authApi, getReportById } from "../../services";
import { useMe } from "../../services/user";
import { LOCAL_STORAGE_KEYS } from "../../utils/localStorage";
import { stringAvatar } from "../../utils/utils";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import Logo from "../logo/Logo";
import SnackBar from "../snackBar/SnackBar";
import HeaderLink from "./HeaderLink";

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAllAsRead,
    clearNotifications,
  } = useNotificationCenter();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN),
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const open = Boolean(anchorEl);
  const notificationsOpen = Boolean(notificationAnchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setNotificationAnchorEl(event.currentTarget);
    markAllAsRead();
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationSelect = (reportId?: number) => {
    handleNotificationClose();

    if (typeof reportId === "number") {
      navigate(PATHS.REPORT_DETAILS.replace(":id", String(reportId)));
    }
  };

  const [waiting, setWaiting] = useState(false);
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const respose = await authApi.logout();
      return respose;
    },
    onSuccess: () => {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      clearNotifications();
      globalThis.dispatchEvent(new Event("storage"));
      setToken(null);
      queryClient.clear();
      navigate(PATHS.INDEX);
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
    onSettled: () => {
      setTimeout(() => {
        setWaiting(false);
      }, 2000);
    },
  });

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const { data: user, isLoading, isError } = useMe();
  const isRejectedNotification = (notification: (typeof notifications)[number]) =>
    notification.newStatus === "REJECTED" ||
    notification.type.toUpperCase().includes("REJECT");
  const rejectedNotificationReportIds = Array.from(
    new Set(
      notifications
        .filter(isRejectedNotification)
        .map((notification) => notification.reportId)
        .filter((reportId): reportId is number => typeof reportId === "number"),
    ),
  );
  const rejectedReportsQueries = useQueries({
    queries: rejectedNotificationReportIds.map((reportId) => ({
      queryKey: ["notification-rejected-report", reportId],
      queryFn: () => getReportById(reportId),
      enabled: token !== null,
      staleTime: 60000,
    })),
  });
  const rejectionReasonByReportId = new Map<number, string>();
  const reportTitleByReportId = new Map<number, string>();

  rejectedReportsQueries.forEach((query, index) => {
    const reportId = rejectedNotificationReportIds[index];
    const rejectionReason = query.data?.rejectionReason?.trim();
    const reportTitle = query.data?.title?.trim();

    if (reportId && rejectionReason) {
      rejectionReasonByReportId.set(reportId, rejectionReason);
    }

    if (reportId && reportTitle) {
      reportTitleByReportId.set(reportId, reportTitle);
    }
  });

  const formattedNotifications = notifications.map((notification) => {
    const createdAtLabel = new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(notification.createdAt));

    if (isRejectedNotification(notification)) {
      const rejectionReason =
        notification.rejectionReason ||
        (typeof notification.reportId === "number"
          ? rejectionReasonByReportId.get(notification.reportId)
          : undefined);
      const reportTitle =
        typeof notification.reportId === "number"
          ? reportTitleByReportId.get(notification.reportId)
          : undefined;
      const baseMessage =
        notification.message ||
        t("header.notifications.reportRejectedMessage", {
          reportTitle:
            reportTitle ||
            notification.title ||
            `#${notification.reportId ?? "-"}`,
        });
      const displayMessage =
        rejectionReason &&
        !baseMessage.toLowerCase().includes(rejectionReason.toLowerCase())
          ? `${baseMessage} ${t("header.notifications.rejectionReasonLabel")}: ${rejectionReason}`
          : baseMessage;

      return {
        ...notification,
        createdAtLabel,
        displayTitle:
          notification.title || t("header.notifications.reportRejectedTitle"),
        displayMessage,
        accentColor: "error.main",
      };
    }

    return {
      ...notification,
      createdAtLabel,
      displayTitle: notification.title,
      displayMessage: notification.message,
      accentColor: notification.read ? "text.primary" : "text.primary",
    };
  });

  return isLoading ? (
    <Backdrop
      open={isLoading}
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
    ></Backdrop>
  ) : (
    <header className="text-black w-full h-16 flex items-center justify-between p-5 xl:px-40 bg-white shadow-lg">
      <Logo className="text-black!" textStyle="text-black!" />

      <SnackBar
        open={isError}
        severity="error"
        message={t("header.fetchUserError")}
      />

      {!token && (
        <div className="sm:hidden flex items-center">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-primary hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
          >
            <span className="sr-only">{t("header.openMenu")}</span>
            {isMenuOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
          </button>
        </div>
      )}

      {!token && isMenuOpen && (
        <div className="z-50 absolute top-16 left-0 right-0 bg-white shadow-lg p-5 sm:hidden">
          <ul className="flex flex-col space-y-4 items-end px-2">
            <li>
              <HeaderLink name={t("common.home")} to={PATHS.INDEX} />
            </li>
            <li>
              <HeaderLink name={t("login.title")} to={PATHS.LOGIN} />
            </li>
            <li>
              <HeaderLink name={t("register.title")} to={PATHS.REGISTER} />
            </li>
          </ul>
        </div>
      )}

      <Backdrop
        open={waiting}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <div className="flex flex-col items-center gap-3">
          <MdLogout size={40} className="animate-spin" />
          <span>{t("header.loggingOut")}</span>
        </div>
      </Backdrop>

      <Backdrop
        open={logoutMutation.isError}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <div className="flex flex-col items-center gap-3">
          <MdClose size={40} className="text-red-500" />
          <span>{t("header.logoutFailed")}</span>
        </div>
      </Backdrop>

      <SnackBar
        open={logoutMutation.isSuccess && waiting}
        message={t("header.logoutSuccess")}
        severity="success"
      />

      {token ? (
        <nav className="sm:flex items-center lg:gap-4">
          <LanguageSwitcher />
          <Button
            variant="text"
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            startIcon={
              <Avatar
                {...stringAvatar(user?.fullName || "")}
                className="font-semibold!"
                sx={{ width: 30, height: 30, fontSize: "14px !important" }}
              />
            }
            className="capitalize! flex items-center space-x-3 text-gray-700 bg-gray-200! transition-all duration-300 ease-in-out rounded-[20px]! px-2! py-1!"
          >
            <span className="text-gray-700 font-medium text-lg max-lg:text-sm">
              {user?.fullName}
            </span>
          </Button>

          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{ list: { "aria-labelledby": "basic-button" } }}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <IoMdSettings />
              </ListItemIcon>
              <ListItemText>
                <Link to={PATHS.SETTINGS}>{t("header.settings")}</Link>
              </ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => logoutMutation.mutate()}>
              <ListItemIcon>
                <MdLogout />
              </ListItemIcon>
              <ListItemText>{t("header.logout")}</ListItemText>
            </MenuItem>
          </Menu>

          <Menu
            id="notifications-menu"
            anchorEl={notificationAnchorEl}
            open={notificationsOpen}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ width: 340, maxWidth: "90vw", py: 1 }}>
              <Typography sx={{ px: 2, pb: 1, fontWeight: 700 }}>
                {t("header.notifications.title")}
              </Typography>
              <Divider />
              {notificationsLoading ? (
                <Typography sx={{ px: 2, py: 2, color: "text.secondary" }}>
                  {t("common.loading")}
                </Typography>
              ) : formattedNotifications.length === 0 ? (
                <Typography sx={{ px: 2, py: 2, color: "text.secondary" }}>
                  {t("header.notifications.empty")}
                </Typography>
              ) : (
                formattedNotifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleNotificationSelect(notification.reportId)}
                    sx={{
                      alignItems: "flex-start",
                      whiteSpace: "normal",
                      py: 1.5,
                      backgroundColor: notification.read
                        ? "transparent"
                        : "action.hover",
                      borderLeft: 3,
                      borderLeftColor: notification.accentColor,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {notification.displayTitle}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mt: 0.5 }}
                      >
                        {notification.displayMessage}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.disabled", display: "block", mt: 0.75 }}
                      >
                        {notification.createdAtLabel}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Box>
          </Menu>

          <IconButton
            onClick={handleNotificationClick}
            className="transition-all duration-300 ease-in-out hover:text-primary hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary active:text-primary"
          >
            <Badge badgeContent={unreadCount} color="error">
              <IoIosNotificationsOutline className="text-xl text-gray-700 hover:text-primary" />
            </Badge>
          </IconButton>
        </nav>
      ) : (
        <nav className="hidden sm:flex items-center gap-5">
          <LanguageSwitcher />
          <ul className="flex space-x-5">
            <li>
              <HeaderLink name={t("common.home")} to={PATHS.INDEX} />
            </li>
            <li>
              <HeaderLink name={t("login.title")} to={PATHS.LOGIN} />
            </li>
            <li>
              <HeaderLink name={t("register.title")} to={PATHS.REGISTER} />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
