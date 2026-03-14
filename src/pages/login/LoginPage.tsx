import { Box, Grow, Typography } from "@mui/material";
import styles from "./login.module.css";
import loginImage from "../../assets/login-image.jpg";
import LoginForm from "../../components/forms/login/LoginForm";
import Logo from "../../components/logo/Logo";

export default function LoginPage() {
  return (
    <Box className={styles.loginContainer}>
      <Logo className="absolute top-5 left-5" />
      <Grow in timeout={1000}>
        <Box
          sx={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${loginImage})`,
          }}
          className={styles.leftSection}
        >
          <Box>
            <div className={styles.quoteContainer}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, fontSize: 30, lineHeight: 1.4 }}
              >
                "A simple way to report and track issues in our community."
              </Typography>
            </div>

            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 20 }}>
              Marie Nguemo
            </Typography>

            <Typography variant="caption" sx={{ fontSize: 14, opacity: 0.8 }}>
              Community Leader, Dschang
            </Typography>
          </Box>
        </Box>
      </Grow>
      <Box className={styles.rightSection}>
        <Box className={styles.formWrapper}>
          <LoginForm />
        </Box>
      </Box>
    </Box>
  );
}
