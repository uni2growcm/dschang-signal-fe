import { LOCAL_STORAGE_KEYS } from "./localStorage";

function stringToColor(string: string) {
  let hash = 0;
  let i: number;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.codePointAt(i) ?? +((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export const stringAvatar = (name: string) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
      size: 30,
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
};

export const isAuth = (): boolean => {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  return token !== null && token !== "";
};
