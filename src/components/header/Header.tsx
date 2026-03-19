import { Avatar, Button, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link } from "react-router";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import Logo from "../logo/Logo";

export default function Header() {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  function stringToColor(string: string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  function stringAvatar(name: string) {
    return {
      sx: {
        bgcolor: stringToColor(name),
        size: 30,
      },
      children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
    };
  }

  return (
    <header className="text-black w-full h-16 flex items-center justify-between px-5 bg-white shadow-lg">
      <Logo className="text-black" textcolor="black" />
      {token ? (
        <nav className="flex items-center lg:gap-4">
          <LanguageSwitcher />
          <Button
            variant="text"
            startIcon={
              <Avatar
                sizes="14px"
                {...stringAvatar("Duval Moi")}
                className="font-semibold! "
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: "14px !important",
                }}
              />
            }
            className="capitalize! flex items-center space-x-3 text-gray-700 bg-gray-200! transition-all duration-300 ease-in-out rounded-[20px]! px-2! py-1!"
          >
            <span className="text-gray-700 font-medium text-lg">Duval Moi</span>
          </Button>

          <IconButton
            className="transition-all duration-300 ease-in-out 
               hover:text-primary hover:scale-110 
               focus:outline-none focus:ring-2 focus:ring-primary 
               active:text-primary"
          >
            <IoIosNotificationsOutline className="text-xl text-gray-700 hover:text-primary" />
          </IconButton>
        </nav>
      ) : (
        <nav className="flex items-center gap-5">
          <LanguageSwitcher />
          <ul className="flex space-x-5">
            <li>
              <Link
                to="/"
                className="text-xl text-gray-700 transition-all duration-300 ease-in-out hover:text-primary hover:underline hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary active:text-primary font-semibold"
              >
                {t("common.home")}
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-xl text-gray-700 transition-all duration-300 ease-in-out hover:text-primary hover:underline hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary active:text-primary font-semibold"
              >
                {t("login.title")}
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="text-xl text-gray-700 transition-all duration-300 ease-in-out hover:text-primary hover:underline hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary active:text-primary font-semibold"
              >
                {t("register.title")}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
