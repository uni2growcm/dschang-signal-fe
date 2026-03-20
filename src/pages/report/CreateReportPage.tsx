import { Typography } from "@mui/material";
import ReportForm from "../../components/report/ReportForm";
import Header from "../../components/header/Header";
import { Link } from "react-router";
import { PATHS } from "../../routes/PATHS";
import styles from "./CreateReportPage.module.css";

export default function CreateReportPage() {
  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        <Link
          to={PATHS.INDEX}
          className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all w-fit"
        >
          ← Back to Home
        </Link>
        <div className={styles.pageHeader}>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#1a1a2e", textAlign: "center" }}>
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