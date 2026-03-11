import { Box } from "@mui/material";
import LoginForm from "../form/LoginForm";
import styles from "./LoginRightSection.module.css";

export default function LoginRightSection() {
  return (
    <Box className={styles.rightSection}>
      <Box className={styles.formWrapper}>
        <LoginForm />
      </Box>
    </Box>
  );
}
