import type React from "react";
import styles from "./reportCard.module.css";

type Props = {
  report: {
    id: number;
    photoUrl?: string;
    description: string;
    reportStatus: string;
    author?: {
      name?: string;
      email?: string;
    };
  };
};

export function ReportCard({ report }: Props): React.JSX.Element {
  const authorName = report.author?.name || "Anonymous";
  const authorEmail = report.author?.email || "N/A";
  const image = report.photoUrl;
  const description = report.description || "No description provided.";
  const status = report.reportStatus;

  return (
    <div className={styles.reportCard}>
      <p className={styles.description}>{description}</p>
      <p className={styles.status}>Status: {status}</p>
      {report.author && (
        <div className={styles.userInfo}>
          <strong>{authorName}</strong>
          <strong>{authorEmail}</strong>
        </div>
      )}
      {image && <img src={image} alt="Report" className={styles.image} />}
    </div>
  );
}
