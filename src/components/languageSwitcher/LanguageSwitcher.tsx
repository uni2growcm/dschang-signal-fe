import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = async (event: SelectChangeEvent<string>) => {
    const selectedLanguage = event.target.value;
    await i18n.changeLanguage(selectedLanguage);
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
        <MenuItem value="en">En</MenuItem>
        <MenuItem value="fr">Fr</MenuItem>
        <MenuItem value="it">It</MenuItem>
        <MenuItem value="de">De</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
