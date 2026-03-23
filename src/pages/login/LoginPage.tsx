import { Box, Grow, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import loginImage from "../../assets/login-image.jpg";
import LoginForm from "../../components/forms/login/LoginForm";
import Logo from "../../components/logo/Logo";
import styles from "./login.module.css";

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <Box className={`${styles.loginContainer} max-sm:flex-col`}>
      <Logo
        col
        className="absolute max-sm:relative top-5 sm:left-5 max-sm:self-center"
      />
      <Grow in timeout={1000}>
        <Box
          sx={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${loginImage})`,
          }}
          className={`${styles.leftSection} max-sm:hidden!`}
        >
          <Box>
            <div className={styles.quoteContainer}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, fontSize: 30, lineHeight: 1.4 }}
              >
                "{t("login.quote")}"
              </Typography>
            </div>

            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 20 }}>
              {t("login.quoter")}
            </Typography>

            <Typography variant="caption" sx={{ fontSize: 14, opacity: 0.8 }}>
              {t("login.quoterTitle")}
            </Typography>
          </Box>
        </Box>
      </Grow>
      <Box className={`${styles.rightSection} max-sm:bg-white!`}>
        <Box className={styles.formWrapper}>
          <LoginForm />
        </Box>
      </Box>
    </Box>
  );
}
