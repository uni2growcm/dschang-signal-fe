import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { deleteReport, getReportById } from "../../services";
import { PATHS } from "../../routes/PATHS";
import { useMe } from "../../services/user";
import styles from "./ReportDetailsPage.module.css";

export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(Number(id)),
    enabled: Boolean(id),
  });

  const { data: currentUser } = useMe();

  const deleteMutation = useMutation({
    mutationFn: () => deleteReport(Number(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["getAuthenticatedUserReports"] });
      void queryClient.invalidateQueries({ queryKey: ["getPublicReports"] });
      navigate(PATHS.INDEX);
    },
  });

  const isOwner = currentUser?.id === report?.createdBy?.id;
  const isPending = report?.reportStatus === "PENDING";
  const canDelete = isOwner && isPending;
  const canEdit =
    isOwner &&
    report?.moderationStatus === "PENDING_REVIEW" &&
    report?.reportStatus === "PENDING";

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className="mt-20 flex flex-1 items-center justify-center">
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
      <div className={styles.contentWrapper}>
        <div className="flex items-center justify-between">
          <Link
            to={PATHS.INDEX}
            className="w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            Back to Home
          </Link>

          <div className="flex gap-3">
            {canEdit && (
              <Link
                to={PATHS.EDIT_REPORT.replace(":id", String(report.id))}
                className="w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                Edit Report
              </Link>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                Delete Report
              </button>
            )}

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DialogTitle>Delete Report</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this report? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                >
                  Yes, Delete
                </button>
              </DialogActions>
            </Dialog>
          </div>
        </div>

        {deleteMutation.isError && (
          <p className="text-center text-sm text-red-500">
            {(deleteMutation.error as Error)?.message || "Failed to delete report"}
          </p>
        )}

        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>{report.title || "Untitled Report"}</h1>
              <p className={styles.location}>{report.locationText || "No location provided"}</p>
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
              {report.reportStatus || "UNKNOWN"}
            </span>
          </div>
          <p className={styles.description}>{report.description || "No description provided"}</p>
          <div className={styles.meta}>
            <span>
              Created at: {report.createdAt ? new Date(report.createdAt).toLocaleString() : "N/A"}
            </span>
            <span>Moderation: {report.moderationStatus || "N/A"}</span>
            {report.createdBy && <span>Reported by: {report.createdBy.fullName || "Unknown"}</span>}
          </div>
          <div className={styles.categories}>
            {report.categories?.length ? (
              report.categories.map((category) => (
                <span key={category.id} className={styles.categoryChip}>
                  #{category.name || "Unnamed"}
                </span>
              ))
            ) : (
              <span className={styles.categoryChip}>No categories</span>
            )}
          </div>
        </div>

        <div className={styles.mediaContainer}>
          {report.medias?.length ? (
            report.medias.map((media) => {
              const fullUrl = media?.url ? `http://localhost:8080${media.url}` : "";

              if (!fullUrl) {
                return null;
              }

              if (media.mimeType?.startsWith("image")) {
                return (
                  <img
                    key={media.id}
                    src={fullUrl}
                    alt="media"
                    className={styles.media}
                    onError={(event) => {
                      (event.target as HTMLImageElement).style.display = "none";
                    }}
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
                  Download document
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
