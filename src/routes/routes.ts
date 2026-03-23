import { createBrowserRouter, redirect } from "react-router";
import LoginPage from "../pages/login/LoginPage";
import NotFound from "../pages/notFound/NotFound";
import RegisterPage from "../pages/register/RegisterPage";
import { PATHS } from "./PATHS";
import Home from "../pages/home/Home";
import { Settings } from "../pages/settings/Settings";
import CreateReportPage from "../pages/report/CreateReportPage";
import ReportDetailsPage from "../pages/report/ReportDetailsPage";
import { LOCAL_STORAGE_KEYS } from "../utils/localStorage";
import EditReportPage from "../pages/report/EditReportPage";
import Layout from "../components/layout/Layout";

const isAuthenticated: boolean = !!localStorage.getItem(
  LOCAL_STORAGE_KEYS.TOKEN,
);

export const clientsRoutes = createBrowserRouter([
  {
    path: PATHS.INDEX,
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: PATHS.CREATE_REPORT,
        Component: CreateReportPage,
      },
      {
        path: PATHS.REPORT_DETAILS,
        Component: ReportDetailsPage,
      },
      {
        path: PATHS.EDIT_REPORT,
        Component: EditReportPage,
      },
      {
        path: PATHS.SETTINGS,
        Component: Settings,
      },
    ],
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
    path: PATHS.NOT_FOUND,
    Component: NotFound,
  },
]);
