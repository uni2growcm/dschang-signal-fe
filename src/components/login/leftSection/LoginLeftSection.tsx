import { Box, Typography } from "@mui/material";
import loginImage from "../../../assets/login-image.jpg";
import styles from "./LoginLeftSection.module.css";

export default function LoginLeftSection() {
  return (
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
            sx={{ fontWeight: 600, fontSize: "24px", lineHeight: 1.4 }}
          >
            "A simple way to report and track issues in our community."
          </Typography>
        </div>

        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Marie Nguemo
        </Typography>

        <Typography variant="caption">Community Leader, Dschang</Typography>
      </Box>
    </Box>
  );
}
