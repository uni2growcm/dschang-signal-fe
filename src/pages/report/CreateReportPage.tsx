import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import ReportForm from "../../components/report/ReportForm";
import { PATHS } from "../../routes/PATHS";
import styles from "./CreateReportPage.module.css";

export default function CreateReportPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <Link
          to={PATHS.INDEX}
          className="w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
        >
          ← {t("reportPage.backHome")}
        </Link>
        <div className={styles.pageHeader}>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1a1a2e",
              textAlign: "center",
            }}
          >
            {t("reportPage.title")}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#666", mt: 0.5, textAlign: "center" }}
          >
            {t("reportPage.subtitle")}
          </Typography>
        </div>
        <ReportForm />
      </div>
    </div>
  );
}
