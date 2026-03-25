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
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { PATHS } from "../../routes/PATHS";
import { deleteReport, getReportById } from "../../services";
import { useMe } from "../../services/user";
import styles from "./ReportDetailsPage.module.css";
import { ReportModerationStatusEnum, type Report } from "../../api";
import { useMediaViewer } from "../../hooks/useMediaViewer";
import MediaViewer from "../../components/media/MediaViewer";

interface LocalMedia {
  id: number;
  url: string;
  mimeType: string;
  originalName?: string;
}

const formatStatus = (status: "PENDING" | "IN_PROGRESS" | "RESOLVED") =>
  status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

const formatModerationStatus = (
  status: "PENDING_REVIEW" | "ACCEPTED" | "REJECTED",
) =>
  status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

export default function ReportDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const viewer = useMediaViewer();

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
      void queryClient.invalidateQueries({
        queryKey: ["getAuthenticatedUserReports"],
      });
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
    return <Navigate to={PATHS.NOT_FOUND} replace />;
  }

  const getTranslatedStatusLabel = (
    status?: "PENDING" | "IN_PROGRESS" | "RESOLVED",
  ) => {
    if (!status) {
      return "UNKNOWN";
    }

    switch (status) {
      case "PENDING":
        return t("home.statusPending");
      case "IN_PROGRESS":
        return t("home.statusInProgress");
      case "RESOLVED":
        return t("home.statusResolved");
      default:
        return formatStatus(status);
    }
  };

  const getTranslatedModerationStatusLabel = (
    status?: "PENDING_REVIEW" | "ACCEPTED" | "REJECTED",
  ) => {
    if (!status) {
      return "N/A";
    }

    switch (status) {
      case "PENDING_REVIEW":
        return t("home.moderationPendingReview");
      case "ACCEPTED":
        return t("home.moderationAccepted");
      case "REJECTED":
        return t("home.moderationRejected");
      default:
        return formatModerationStatus(status);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className="flex items-center justify-between">
          <Link
            to={PATHS.INDEX}
            className="w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            {t("reportDetails.backHome")}
          </Link>

          <div className="flex gap-3">
            {canEdit && (
              <Link
                to={PATHS.EDIT_REPORT.replace(":id", String(report.id))}
                className="w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                {t("reportDetails.editReport")}
              </Link>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                {t("reportDetails.deleteReport")}
              </button>
            )}

            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
            >
              <DialogTitle>{t("reportDetails.deleteTitle")}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {t("reportDetails.deleteMessage")}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
                >
                  {t("reportDetails.no")}
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
                  {t("reportDetails.yesDelete")}
                </button>
              </DialogActions>
            </Dialog>
          </div>
        </div>

        {deleteMutation.isError && (
          <p className="text-center text-sm text-red-500">
            {(deleteMutation.error as Error)?.message ||
              t("reportDetails.deleteError")}
          </p>
        )}

        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>
                {report.title || t("reportDetails.untitledReport")}
              </h1>
              <p className={styles.location}>
                {report.locationText || t("reportDetails.noLocation")}
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
              {getTranslatedStatusLabel(report.reportStatus)}
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
            <span>
              Moderation:{" "}
              {getTranslatedModerationStatusLabel(report.moderationStatus)}
            </span>
            {report.createdBy && (
              <span>Reported by: {report.createdBy.fullName || "Unknown"}</span>
            )}
            {report.createdBy?.fullName == currentUser?.fullName && (
              <div className="flex items-end flex-col gap-1">
                {report.moderationStatus !=
                  ReportModerationStatusEnum.PendingReview && (
                  <span>
                    Reviewed at:{" "}
                    {report.reviewedAt
                      ? new Date(report.reviewedAt).toLocaleString()
                      : "N/A"}
                  </span>
                )}
                {report.moderationStatus ==
                  ReportModerationStatusEnum.Rejected && (
                  <span>
                    Rejection reason: {report.rejectionReason || "N/A"}
                  </span>
                )}
              </div>
            )}
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
            (report.medias as LocalMedia[]).map((media: LocalMedia) => {
              const fullUrl = media?.url
                ? `http://localhost:8080${media.url}`
                : "";

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
                    onClick={() =>
                      viewer.openViewer(
                        {
                          id: media.id,
                          url: fullUrl,
                          mimeType: media.mimeType || "",
                          fileName: media.originalName,
                        },
                        (report.medias as LocalMedia[])
                          .filter(
                            (m: LocalMedia) =>
                              m.mimeType?.startsWith("image") ||
                              m.mimeType?.startsWith("video"),
                          )
                          .map((m: LocalMedia) => ({
                            id: m.id,
                            url: `http://localhost:8080${m.url}`,
                            mimeType: m.mimeType || "",
                            fileName: m.originalName,
                          })),
                      )
                    }
                    style={{ cursor: "pointer" }}
                    onError={(event) => {
                      (event.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                );
              }

              // Vidéos
              if (media.mimeType?.startsWith("video")) {
                const handleVideoClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const videoElement = e.currentTarget as HTMLVideoElement;

                  // Arrêter complètement la vidéo miniature
                  videoElement.pause();
                  videoElement.currentTime = 0;
                  // Supprimer la source pour libérer la mémoire
                  videoElement.src = "";
                  videoElement.load();

                  viewer.openViewer(
                    {
                      id: media.id,
                      url: fullUrl,
                      mimeType: media.mimeType || "",
                      fileName: media.originalName,
                    },
                    (report.medias as LocalMedia[])
                      .filter(
                        (m: LocalMedia) =>
                          m.mimeType?.startsWith("image") ||
                          m.mimeType?.startsWith("video"),
                      )
                      .map((m: LocalMedia) => ({
                        id: m.id,
                        url: `http://localhost:8080${m.url}`,
                        mimeType: m.mimeType || "",
                        fileName: m.originalName,
                      })),
                  );
                };

                return (
                  <video
                    key={media.id}
                    controls
                    className={styles.media}
                    onClick={handleVideoClick}
                    style={{ cursor: "pointer" }}
                  >
                    <source src={fullUrl} type={media.mimeType || ""} />
                  </video>
                );
              }

              if (media.mimeType?.startsWith("audio")) {
                return (
                  <audio key={media.id} controls className={styles.audio}>
                    <source src={fullUrl} type={media.mimeType || ""} />
                  </audio>
                );
              }

              const isPdf =
                media.mimeType === "application/pdf" ||
                media.originalName?.toLowerCase().endsWith(".pdf");
              const isDoc =
                media.mimeType === "application/msword" ||
                media.originalName?.toLowerCase().endsWith(".doc") ||
                media.originalName?.toLowerCase().endsWith(".docx");

              let icon = "📄";
              let fileType = "Document";

              if (isPdf) {
                icon = "📑";
                fileType = "PDF";
              } else if (isDoc) {
                icon = "📝";
                fileType = "Word";
              }

              return (
                <a
                  key={media.id}
                  href={fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.documentLink}
                >
                  <span className={styles.documentIcon}>{icon}</span>
                  <span className={styles.documentInfo}>
                    <span className={styles.documentType}>{fileType}</span>
                    <span className={styles.documentName}>
                      {media.originalName || "Document"}
                    </span>
                  </span>
                </a>
              );
            })
          ) : (
            <p>No media available</p>
          )}
        </div>
      </div>
      <MediaViewer viewer={viewer} />
    </div>
  );
}
