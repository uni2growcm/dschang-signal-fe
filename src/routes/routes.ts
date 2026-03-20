import { createBrowserRouter, redirect } from "react-router";
import LoginPage from "../pages/login/LoginPage";
import NotFound from "../pages/notFound/NotFound";
import RegisterPage from "../pages/register/RegisterPage";
import { PATHS } from "./PATHS";
import Home from "../pages/home/Home";
import CreateReportPage from "../pages/report/CreateReportPage";
import { LOCAL_STORAGE_KEYS } from "../utils/localStorage";

const isAuthenticated: boolean = !!localStorage.getItem(
  LOCAL_STORAGE_KEYS.TOKEN,
);

export const clientsRoutes = createBrowserRouter([
  {
    index: true,
    Component: Home,
  },
  {
    path: PATHS.LOGIN,
    Component: LoginPage,
    loader: () => {
      if (isAuthenticated) throw redirect(PATHS.INDEX);
    },
  },
  {
    path: PATHS.REGISTER,
    Component: RegisterPage,
    loader: () => {
      if (isAuthenticated) throw redirect(PATHS.INDEX);
    },
  },
  {
    path: PATHS.CREATE_REPORT,
    Component: CreateReportPage,
  },
  {
    path: PATHS.NOT_FOUND,
    Component: NotFound,
  },
]);