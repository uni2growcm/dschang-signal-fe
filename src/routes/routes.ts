
import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/login/LoginPage";
import NotFound from "../pages/notFound/NotFound";

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
        path: "*",
        Component: NotFound 
    }
]);