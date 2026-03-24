import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small" variant="outlined" sx={{ minWidth: 100 }}>
      <Select
        variant="outlined"
        value={i18n.language}
        onChange={handleLanguageChange}
        sx={{
          color: "inherit",
          ".MuiOutlinedInput-notchedOutline": {
            border: 0,
          },
        }}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="fr">Français</MenuItem>
        <MenuItem value="it">Italiano</MenuItem>
        <MenuItem value="de">Deutsch</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
