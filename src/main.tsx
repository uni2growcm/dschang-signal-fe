import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App.tsx";
import { NotificationCenterProvider } from "./contexts/NotificationCenter.tsx";
import "./i18n/i18n";
import "./index.css";
import theme from "./theme";

const queryClient = new QueryClient();

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient;

const GOOGLE_CLIENT_ID =
  "270719315111-cqvfgncjvu1gnqeb941uku41d21kvqmm.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {" "}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <NotificationCenterProvider>
            <App />
          </NotificationCenterProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
