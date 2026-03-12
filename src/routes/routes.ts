
import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/login/LoginPage";
import RegisterPage from "../pages/register/RegisterPage";

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
    path: "/register",  
    Component: RegisterPage, 
  },
    
]);