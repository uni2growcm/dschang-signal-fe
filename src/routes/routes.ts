import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/login/LoginPage";
import NotFound from "../pages/notFound/NotFound";
import RegisterPage from "../pages/register/RegisterPage";
import { PATHS } from "./PATHS";

export const clientsRoutes = createBrowserRouter([
  {
    index: true,
    Component: LoginPage,
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
    path: PATHS.NOT_FOUND,
    Component: NotFound,
  },
]);
