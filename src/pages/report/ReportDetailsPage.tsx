import { useParams, Navigate, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReportById, deleteReport } from "../../services";
import { useMe } from "../../services/user";
import { PATHS } from "../../routes/PATHS";
import styles from "./ReportDetailsPage.module.css";
import { useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

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
  const canEdit =
    isOwner &&
    report?.moderationStatus === "PENDING_REVIEW" &&
    report?.reportStatus === "PENDING";

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
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
      <div className={styles.contentWrapper}>
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
                Edit Report
              </Link>
            )}

            {canDelete && (
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-all"
              >
                Delete Report
              </button>
            )}

            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
            >
              <DialogTitle>Delete Report</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this report? This action
                  cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="px-4 py-2 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-all"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  Yes, Delete
                </button>
              </DialogActions>
            </Dialog>
          </div>
        </div>

        {deleteMutation.isError && (
          <p className="text-red-500 text-sm text-center">
            {(deleteMutation.error as Error)?.message ||
              "Failed to delete report"}
          </p>
        )}

        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>
                {report.title || "Untitled Report"}
              </h1>
              <p className={styles.location}>
                {report.locationText || "No location provided"}
              </p>
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
            <span>Moderation: {report.moderationStatus || "N/A"}</span>
            {report.createdBy && (
              <span>Reported by: {report.createdBy.fullName || "Unknown"}</span>
            )}
          </div>
          <div className={styles.categories}>
            {report.categories?.length ? (
              report.categories.map((cat: any) => (
                <span key={cat.id} className={styles.categoryChip}>
                  #{cat.name || "Unnamed"}
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
              const fullUrl = media?.url
                ? `http://localhost:8080${media.url}`
                : "";

              if (!fullUrl) return null;

              if (media.mimeType?.startsWith("image")) {
                return (
                  <img
                    key={media.id}
                    src={fullUrl}
                    alt="media"
                    className={styles.media}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
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
