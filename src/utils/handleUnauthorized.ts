import { removeToken } from "./localStorage";

let isHandlingUnauthorized = false;

export const handleUnauthorized = async (): Promise<void> => {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  removeToken();

  isHandlingUnauthorized = false;

  setTimeout(() => {
    window.location.href = "/login";
  }, 100);
};