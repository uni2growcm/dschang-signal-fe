import { t } from "i18next";
import { useNavigate } from "react-router";
import styles from "./notFound.module.css";

function NotFound() {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate("/");
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.code}>{t("notFound.code")}</h1>
      <h2 className={styles.title}>{t("notFound.title")}</h2>
      <p className={styles.text}>{t("notFound.text")}</p>
      <button className={styles.button} onClick={handleGoBack}>
        {t("notFound.button")}
      </button>
    </div>
  );
}

export default NotFound;
