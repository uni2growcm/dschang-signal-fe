import { useParams, Navigate, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { getReportById, deleteReport } from "../../services";
import { useMe } from "../../services/user";
import Header from "../../components/header/Header";
import { Link } from "react-router";
import { PATHS } from "../../routes/PATHS";
import styles from "./ReportDetailsPage.module.css";

export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(Number(id)),
    enabled: !!id,
  });

  const { data: currentUser } = useMe();

  const deleteMutation = useMutation({
    mutationFn: () => deleteReport(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getAuthenticatedUserReports"],
      });
      queryClient.invalidateQueries({ queryKey: ["getPublicReports"] });
      navigate(PATHS.INDEX);
    },
  });

  const isOwner = currentUser?.id === report?.createdBy?.id;
  const isPending = report?.reportStatus === "PENDING";
  const canDelete = isOwner && isPending;
  const canEdit = isOwner
  && report?.moderationStatus === "PENDING_REVIEW"
  && report?.reportStatus === "PENDING";

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className="flex justify-center items-center flex-1 mt-20">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Link
            to={PATHS.INDEX}
            className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all w-fit"
          >
            ← Back to Home
          </Link>

          <div className="flex gap-3">
            {canEdit && (
              <Link
                to={PATHS.EDIT_REPORT.replace(":id", String(report.id))}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all w-fit"
              >
                ✏️ Edit Report
              </Link>
            )}

            {canDelete && (
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "🗑 Delete Report"}
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {deleteMutation.isError && (
          <p className="text-red-500 text-sm text-center">
            {(deleteMutation.error as Error)?.message ||
              "Failed to delete report"}
          </p>
        )}

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
