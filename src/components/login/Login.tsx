import { Box } from "@mui/material";
import LoginLeftSection from "./leftSection/LoginLeftSection";
import styles from "./login.module.css";
import LoginRightSection from "./rightSection/LoginRightSection";

export default function Login() {
  return (
    <Box className={styles.loginContainer}>
      <LoginLeftSection />
      <LoginRightSection />
    </Box>
  );
}
