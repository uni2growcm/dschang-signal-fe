import { t } from 'i18next';
import { useNavigate, useLocation } from 'react-router';
import styles from './notFound.module.css';

function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  const isReportNotFound = location.state?.fromReport;

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.code}>
        {isReportNotFound ? '404' : t('notFound.code')}
      </h1>

      <h2 className={styles.title}>
        {t('notFound.title')}
      </h2>

      <p className={styles.text}>
        {isReportNotFound ? t('notFound.reportText') : t('notFound.message')}
      </p>

      <button className={styles.button} onClick={handleGoBack}>
        {t('notFound.backHome')}
      </button>
    </div>
  );
}

export default NotFound;
