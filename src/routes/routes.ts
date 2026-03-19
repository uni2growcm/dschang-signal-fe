import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/login/LoginPage";
import NotFound from "../pages/notFound/NotFound";
import RegisterPage from "../pages/register/RegisterPage";
import { PATHS } from "./PATHS";
import Home from "../pages/home/Home";
import CreateReportPage from "../pages/report/CreateReportPage";

export const clientsRoutes = createBrowserRouter([
  {
    index: true,
    Component: Home,
  },
  {
    path: PATHS.LOGIN,
    Component: LoginPage,
  },
  {
    path: PATHS.REGISTER,
    Component: RegisterPage,
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