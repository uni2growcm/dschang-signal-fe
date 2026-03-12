
import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/login/LoginPage";

export const clientsRoutes = createBrowserRouter([
    {
        index: true,
        Component: LoginPage,
    },
    {
        path: "/login",
        Component: LoginPage,
    },
]);