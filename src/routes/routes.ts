import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import NotFound from "../pages/notFound/NotFound";
import RegisterPage from "../pages/register/RegisterPage";
import { PATHS } from "./PATHS";
import Home from "../pages/home/Home";
import ReportDetailsPage from "../pages/report/ReportDetailsPage";

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
    path: PATHS.REPORT_DETAILS,
    Component: ReportDetailsPage,
  },
  {
    path: PATHS.NOT_FOUND,
    Component: NotFound,
  },
]);