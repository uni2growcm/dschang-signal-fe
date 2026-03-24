import { Box, Grow, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import registerImage from "../../assets/register-image.png";
import Logo from "../../components/logo/Logo";
import RegisterForm from "../../components/register/RegisterForm";
import styles from "./register.module.css";

export default function RegisterPage() {
  const { t } = useTranslation();
  return (
    <Box className={`${styles.registerContainer} max-sm:flex-col`}>
      <Logo
        col
        className="absolute max-sm:relative top-5 sm:left-5 max-sm:self-center"
      />

      <Grow in timeout={1000}>
        <Box
          sx={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${registerImage})`,
          }}
          className={`${styles.leftSection} max-sm:hidden!`}
        >
          <Box>
            <div className={styles.quoteContainer}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, fontSize: 30, lineHeight: 1.4 }}
              >
                "{t("registerPage.quote")}"
              </Typography>
            </div>

            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 20 }}>
              {t("registerPage.author")}
            </Typography>

            <Typography variant="caption" sx={{ fontSize: 14, opacity: 0.8 }}>
              {t("registerPage.role")}
            </Typography>
          </Box>
        </Box>
      </Grow>

      <Box className={`${styles.rightSection} max-sm:bg-white!`}>
        <Box className={styles.formWrapper}>
          <RegisterForm />
        </Box>
      </Box>
    </Box>
  );
}
