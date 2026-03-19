import { RouterProvider } from "react-router";
import { clientsRoutes } from "./routes/routes";

export default function App() {
  return <RouterProvider router={clientsRoutes} />;
}
