
import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/login/LoginPage";
import {Settings} from "../pages/settings/Settings";

export const clientsRoutes = createBrowserRouter([
    {
        index: true,
        Component: LoginPage,
    },
    {
        path: "/login",
        Component: LoginPage,
    },
    {
        path: "/settings",
        Component: Settings,
    }
]);