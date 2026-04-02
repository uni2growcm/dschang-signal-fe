export const LOCAL_STORAGE_KEYS = {
  TOKEN: "token",
};

export const getToken = (): string | null => {
  return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
};

export const removeToken = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
};
