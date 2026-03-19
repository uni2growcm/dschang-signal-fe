import { Box, Typography } from "@mui/material";
import ReportForm from "../../components/report/ReportForm";
import styles from "./CreateReportPage.module.css";

export default function CreateReportPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.pageHeader}>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1a1a2e",
              textAlign: "center",
            }}
          >
            Create a Report
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mt: 0.5, textAlign: "center" }}>
            Help improve your city by reporting an issue
          </Typography>
        </div>
        <ReportForm />
      </div>
    </div>
  );
}