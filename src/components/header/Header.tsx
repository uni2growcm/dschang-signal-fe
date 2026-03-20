import {
  Avatar,
  Backdrop,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosNotificationsOutline, IoMdSettings } from "react-icons/io";
import { MdClose, MdLogout, MdMenu } from "react-icons/md";
import { PATHS } from "../../routes/PATHS";
import { authApi } from "../../services";
import { useMe } from "../../services/user";
import { LOCAL_STORAGE_KEYS } from "../../utils/localStorage";
import { stringAvatar } from "../../utils/utils";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import Logo from "../logo/Logo";
import SnackBar from "../snackBar/SnackBar";
import HeaderLink from "./HeaderLink";

export default function Header() {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [waiting, setWaiting] = useState(false);
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const respose = await authApi.logout();
      return respose;
    },
    onSuccess: () => {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      window.location.href = PATHS.INDEX;
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

  return isLoading ? (
    <Backdrop
      open={isLoading}
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
    ></Backdrop>
  ) : (
    <header className="text-black w-full h-16 flex items-center justify-between p-5 xl:px-40 bg-white shadow-lg">
      <Logo className="text-black" textcolor="black" />

      <SnackBar
        open={isError}
        severity="error"
        message="Failed to fetch user information"
      />

      {!token && (
        <div className="sm:hidden flex items-center">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-primary hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
          </button>
        </div>
      )}

      {!token && isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg p-5 sm:hidden">
          <ul className="flex flex-col space-y-4 items-end px-2">
            <li>
              <HeaderLink name="Home" to={PATHS.INDEX} />
            </li>
            <li>
              <HeaderLink name="Login" to={PATHS.LOGIN} />
            </li>
            <li>
              <HeaderLink name="Register" to={PATHS.REGISTER} />
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
          <span>Logging out...</span>
        </div>
      </Backdrop>

      <Backdrop
        open={logoutMutation.isError}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <div className="flex flex-col items-center gap-3">
          <MdClose size={40} className="text-red-500" />
          <span>Logout failed. Please try again.</span>
        </div>
      </Backdrop>

      <SnackBar
        open={logoutMutation.isSuccess && waiting}
        message="Logged out successfully!"
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
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => logoutMutation.mutate()}>
              <ListItemIcon>
                <MdLogout />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>

          <IconButton className="transition-all duration-300 ease-in-out hover:text-primary hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary active:text-primary">
            <IoIosNotificationsOutline className="text-xl text-gray-700 hover:text-primary" />
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
