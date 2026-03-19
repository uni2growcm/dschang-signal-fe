import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { getReportById } from "../../services";
import styles from "./ReportDetailsPage.module.css";

export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <CircularProgress />
      </div>
    );
  }

  if (isError || !report) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className={styles.pageContainer}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowBack className={styles.icon} />
        <span>Back</span>
      </button>

      <div className={styles.contentWrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>{report.title}</h1>
              <p className={styles.location}>{report.locationText}</p>
            </div>
            <span
              className={`${styles.status} ${
                report.reportStatus === "PENDING"
                  ? styles.pending
                  : report.reportStatus === "IN_PROGRESS"
                    ? styles.inProgress
                    : styles.resolved
              }`}
            >
              {report.reportStatus}
            </span>
          </div>

          <p className={styles.description}>
            {report.description || "No description provided"}
          </p>

          <div className={styles.meta}>
            <span>
              Created at:{" "}
              {report.createdAt
                ? new Date(report.createdAt).toLocaleString()
                : "N/A"}
            </span>
            <span>Moderation: {report.moderationStatus}</span>
            {report.createdBy && (
              <span>Reported by: {report.createdBy.fullName}</span>
            )}
          </div>

          <div className={styles.categories}>
            {report.categories?.length ? (
              report.categories.map((cat: any) => (
                <span key={cat.id} className={styles.categoryChip}>
                  #{cat.name}
                </span>
              ))
            ) : (
              <span className={styles.categoryChip}>No categories</span>
            )}
          </div>
        </div>

        <div className={styles.mediaContainer}>
          {report.medias?.length ? (
            report.medias.map((media: any) => {
              const fullUrl = `http://localhost:8080${media.url}`;

              if (media.mimeType?.startsWith("image")) {
                return (
                  <img
                    key={media.id}
                    src={fullUrl}
                    alt="media"
                    className={styles.media}
                  />
                );
              }

              if (media.mimeType?.startsWith("audio")) {
                return (
                  <audio key={media.id} controls className={styles.audio}>
                    <source src={fullUrl} type={media.mimeType} />
                  </audio>
                );
              }

              return (
                <a
                  key={media.id}
                  href={fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.documentLink}
                >
                  📄 Download document
                </a>
              );
            })
          ) : (
            <p>No media available</p>
          )}
        </div>
      </div>
    </div>
  );
}
