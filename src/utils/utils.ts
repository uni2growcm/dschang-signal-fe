import { LOCAL_STORAGE_KEYS } from "./localStorage";

function stringToColor(string: string) {
  let hash = 0;
  let i: number;

  for (i = 0; i < string.length; i += 1) {
    hash = string.codePointAt(i) ?? +((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

export const stringAvatar = (name: string) => {
  if (!name || name.trim() === "") {
    return {
      sx: {
        bgcolor: "#9e9e9e",
        size: 30,
      },
      children: "?",
    };
  }

  const nameParts = name.split(" ").filter((part) => part.length > 0);

  if (nameParts.length >= 2) {
    return {
      sx: {
        bgcolor: stringToColor(name),
        size: 30,
      },
      children: `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase(),
    };
  }

  if (nameParts.length === 1) {
    return {
      sx: {
        bgcolor: stringToColor(name),
        size: 30,
      },
      children: nameParts[0][0].toUpperCase(),
    };
  }

  return {
    sx: {
      bgcolor: "#9e9e9e",
      size: 30,
    },
    children: "?",
  };
};

export const isAuth = (): boolean => {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  return token !== null && token !== "";
};
