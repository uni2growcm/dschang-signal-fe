import { Box, Typography } from "@mui/material";
import styles from "./register.module.css"; 
import Logo from "../../components/logo/Logo"; 
import RegisterForm from "../../components/register/RegisterForm"; 
import registerImage from "../../assets/register-image.png";

export default function RegisterPage() {
  return (
    <Box className={styles.registerContainer}>
      <Logo className="absolute top-5 left-5" />
      <Box
        sx={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${registerImage})`,
        }}
        className={styles.leftSection}
      >
        <Box>
          <div className={styles.quoteContainer}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, fontSize: 30, lineHeight: 1.4 }}
            >
              "Join us to make a difference in your community."
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
      <Box className={styles.rightSection}>
        <Box className={styles.formWrapper}>
          <RegisterForm />
        </Box>
      </Box>
    </Box>
  );
}