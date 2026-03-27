import { createBrowserRouter, redirect } from "react-router";
import Home from "../pages/home/Home";
import LoginPage from "../pages/login/LoginPage";
import NotFound from "../pages/notFound/NotFound";
import RegisterPage from "../pages/register/RegisterPage";
import CreateReportPage from "../pages/report/CreateReportPage";
import EditReportPage from "../pages/report/EditReportPage";
import ReportDetailsPage from "../pages/report/ReportDetailsPage";
import { Settings } from "../pages/settings/Settings";
import { LOCAL_STORAGE_KEYS } from "../utils/localStorage";
import { PATHS } from "./PATHS";
import Layout from "../components/layout/Layout";

const checkAuth = () => {
  return !!localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
};

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
        loader: () => {
          if (!checkAuth()) {
            return redirect(PATHS.LOGIN);
          }
          return null;
        },
      },
      {
        path: PATHS.REPORT_DETAILS,
        Component: ReportDetailsPage,
      },
      {
        path: PATHS.EDIT_REPORT,
        Component: EditReportPage,
        loader: () => {
          if (!checkAuth()) {
            return redirect(PATHS.LOGIN);
          }
          return null;
        },
      },
      {
        path: PATHS.SETTINGS,
        Component: Settings,
        loader: () => {
          if (!checkAuth()) {
            return redirect(PATHS.LOGIN);
          }
          return null;
        },
      },
    ],
  },
  {
    path: PATHS.LOGIN,
    Component: LoginPage,
    loader: () => {
      if (checkAuth()) {
        return redirect(PATHS.INDEX);
      }
      return null;
    },
  },
  {
    path: PATHS.REGISTER,
    Component: RegisterPage,
    loader: () => {
      if (checkAuth()) {
        return redirect(PATHS.INDEX);
      }
      return null;
    },
  },
  { path: PATHS.NOT_FOUND, Component: NotFound },
  { path: "*", Component: NotFound },
]);
