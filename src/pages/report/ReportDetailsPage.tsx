import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { PATHS } from "../../routes/PATHS";
import {
  deleteReport,
  getReportById,
  updateModerationStatus,
  updateReportStatus,
  usePublicReportById,
} from "../../services";
import { useMe } from "../../services/user";
import styles from "./ReportDetailsPage.module.css";
import {
  ReportModerationStatusEnum,
  ReportReportStatusEnum,
  type CategoryResponse,
  type MediaResponse,
} from "../../api";
import { useMediaViewer, type MediaItem } from "../../hooks/useMediaViewer";
import MediaViewer from "../../components/media/MediaViewer";
import { isAuth } from "../../utils/utils";

const formatStatus = (
  status: ReportModerationStatusEnum | ReportReportStatusEnum,
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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const authenticated = isAuth();

  const {
    data: report,
    isLoading,
    isError,
  } = authenticated
    ? useQuery({
        queryKey: ["report", id],
        queryFn: () => getReportById(Number(id)),
        enabled: Boolean(id),
      })
    : usePublicReportById(id ? Number(id) : null);

  const { data: currentUser } = authenticated ? useMe() : { data: null };

  const [selectedReportStatus, setSelectedReportStatus] =
    useState<ReportReportStatusEnum | null>(null);

  const currentStatus =
    selectedReportStatus ??
    (report?.reportStatus as ReportReportStatusEnum) ??
    "PENDING";

  const invalidateReportQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["report", id] }),
      queryClient.invalidateQueries({
        queryKey: ["getAuthenticatedUserReports"],
      }),
      queryClient.invalidateQueries({ queryKey: ["getPublicReports"] }),
    ]);
  };

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

  const moderationMutation = useMutation({
    mutationFn: (payload: {
      status: ReportModerationStatusEnum;
      rejectionReason?: string;
    }) => updateModerationStatus(Number(id), payload),
    onSuccess: async () => {
      setRejectDialogOpen(false);
      setRejectionReason("");
      await invalidateReportQueries();
    },
  });

  const reportStatusMutation = useMutation({
    mutationFn: (payload: { status: ReportReportStatusEnum }) =>
      updateReportStatus(Number(id), payload),
    onSuccess: async () => {
      await invalidateReportQueries();
    },
  });

  const isOwner = currentUser?.id === report?.createdBy?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const isPending = report?.reportStatus === "PENDING";
  const canDelete = isOwner && isPending;
  const canEdit =
    isOwner &&
    report?.moderationStatus === "PENDING_REVIEW" &&
    report?.reportStatus === "PENDING";
  const canModerate = isAdmin && report?.moderationStatus === "PENDING_REVIEW";
  const canChangeReportStatus =
    isAdmin && report?.moderationStatus === "ACCEPTED";

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

  const getTranslatedStatusLabel = (status?: ReportReportStatusEnum) => {
    if (!status) {
      return t("reportDetails.unknownStatus");
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
    status?: ReportModerationStatusEnum,
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
        return formatStatus(status);
    }
  };

  const adminErrorMessage =
    moderationMutation.error?.message || reportStatusMutation.error?.message;

  const adminLoading =
    moderationMutation.isPending || reportStatusMutation.isPending;
  const displayPendingReviewStatus =
    report.moderationStatus === "PENDING_REVIEW";
  const displayRejectedStatus = report.moderationStatus === "REJECTED";

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

        {(deleteMutation.isError ||
          moderationMutation.isError ||
          reportStatusMutation.isError) && (
          <p className="text-center text-sm text-red-500">
            {deleteMutation.error?.message ||
              adminErrorMessage ||
              t("reportDetails.adminActionError")}
          </p>
        )}

        {isAdmin && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {t("reportDetails.adminActions")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("reportDetails.adminActionsDescription")}
                </p>
              </div>

              {canModerate && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      moderationMutation.mutate({ status: "ACCEPTED" })
                    }
                    disabled={adminLoading}
                    className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {t("reportDetails.acceptReport")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={adminLoading}
                    className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {t("reportDetails.rejectReport")}
                  </button>
                </div>
              )}

              {canChangeReportStatus && (
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex min-w-52 flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t("reportDetails.changeReportStatus")}
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(event) =>
                        setSelectedReportStatus(
                          event.target.value as ReportReportStatusEnum,
                        )
                      }
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="PENDING">{t("home.statusPending")}</option>
                      <option value="IN_PROGRESS">
                        {t("home.statusInProgress")}
                      </option>
                      <option value="RESOLVED">
                        {t("home.statusResolved")}
                      </option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      reportStatusMutation.mutate({
                        status: currentStatus,
                      })
                    }
                    disabled={
                      adminLoading ||
                      selectedReportStatus === report.reportStatus
                    }
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {t("reportDetails.updateStatus")}
                  </button>
                </div>
              )}

              {!canModerate && !canChangeReportStatus && (
                <p className="text-sm text-gray-500">
                  {report.moderationStatus === "REJECTED"
                    ? t("reportDetails.rejectedLockedMessage")
                    : t("reportDetails.noAdminActionAvailable")}
                </p>
              )}
            </div>
          </div>
        )}

        <Dialog
          open={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
        >
          <DialogTitle>{t("reportDetails.rejectTitle")}</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {t("reportDetails.rejectMessage")}
            </DialogContentText>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              label={t("reportDetails.rejectionReason")}
            />
          </DialogContent>
          <DialogActions>
            <button
              type="button"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
            >
              {t("reportDetails.cancel")}
            </button>
            <button
              type="button"
              onClick={() =>
                moderationMutation.mutate({
                  status: "REJECTED",
                  rejectionReason: rejectionReason.trim() || undefined,
                })
              }
              disabled={adminLoading}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {t("reportDetails.confirmReject")}
            </button>
          </DialogActions>
        </Dialog>

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
                displayRejectedStatus
                  ? "bg-red-100 text-red-700"
                  : displayPendingReviewStatus
                    ? "bg-gray-100 text-gray-700"
                    : report.reportStatus === "PENDING"
                      ? styles.pending
                      : report.reportStatus === "IN_PROGRESS"
                        ? styles.inProgress
                        : styles.resolved
              }`}
            >
              {displayRejectedStatus
                ? getTranslatedModerationStatusLabel("REJECTED")
                : displayPendingReviewStatus
                  ? getTranslatedModerationStatusLabel("PENDING_REVIEW")
                  : getTranslatedStatusLabel(
                      report.reportStatus as ReportReportStatusEnum | undefined,
                    )}
            </span>
          </div>
          <p className={styles.description}>
            {report.description || t("reportDetails.no-description-provided")}
          </p>
          <div className={styles.meta}>
            <span>
              {t("reportDetails.createdAt")}:{" "}
              {report.createdAt
                ? new Date(report.createdAt).toLocaleString()
                : "N/A"}
            </span>
            <span>
              {t("reportDetails.moderation")}:{" "}
              {getTranslatedModerationStatusLabel(report.moderationStatus)}
            </span>
            {report.createdBy && (
              <span>
                {t("reportDetails.reported-by")}{" "}
                {report.createdBy.fullName || t("reportDetails.unknown")}
              </span>
            )}
            {report.createdBy?.fullName == currentUser?.fullName && (
              <div className="flex items-end flex-col gap-1">
                {report.moderationStatus !=
                  ReportModerationStatusEnum.PendingReview && (
                  <span>
                    {t("reportDetails.reviewed-at")}{" "}
                    {report.reviewedAt
                      ? new Date(report.reviewedAt).toLocaleString()
                      : "N/A"}
                  </span>
                )}
                {report.moderationStatus ==
                  ReportModerationStatusEnum.Rejected && (
                  <span className="text-red-700 text-end">
                    {t("reportDetails.rejectionReason")}:{" "}
                    {report.rejectionReason}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={styles.categories}>
            {report.categories?.length ? (
              report.categories.map((category: CategoryResponse) => (
                <span key={category.id} className={styles.categoryChip}>
                  #{category.name || t("reportDetails.unnamed")}
                </span>
              ))
            ) : (
              <span className={styles.categoryChip}>
                {t("reportDetails.no-categories")}
              </span>
            )}
          </div>
        </div>

        <div className={styles.mediaContainer}>
          {report.medias?.length ? (
            report.medias.map((media: MediaResponse) => {
              const fullUrl = media?.url
                ? `http://localhost:8080${media.url}`
                : "";

              if (!fullUrl) {
                return null;
              }

              if (media.mimeType?.startsWith("image")) {
                return (
                  <button
                    key={media.id}
                    onClick={() =>
                      viewer.openViewer(
                        {
                          id: media.id as number,
                          url: fullUrl,
                          mimeType: media.mimeType || "",
                          fileName: media.originalName,
                        },
                        report.medias
                          .filter(
                            (m: MediaResponse) =>
                              m.mimeType?.startsWith("image") ||
                              m.mimeType?.startsWith("video"),
                          )
                          .map(
                            (m: MediaResponse) =>
                              ({
                                id: m.id,
                                url: `http://localhost:8080${m.url}`,
                                mimeType: m.mimeType || "",
                                fileName: m.originalName,
                              }) as MediaItem,
                          ),
                      )
                    }
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={fullUrl}
                      alt="media"
                      className={styles.media}
                      onError={(event) => {
                        (event.target as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </button>
                );
              }

              if (media.mimeType?.startsWith("video")) {
                const handleVideoClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const videoElement = e.currentTarget as HTMLVideoElement;

                  videoElement.pause();
                  videoElement.currentTime = 0;

                  videoElement.src = "";
                  videoElement.load();

                  viewer.openViewer(
                    {
                      id: media.id as number,
                      url: fullUrl,
                      mimeType: media.mimeType || "",
                      fileName: media.originalName,
                    },
                    report.medias
                      .filter(
                        (m: MediaResponse) =>
                          m.mimeType?.startsWith("image") ||
                          m.mimeType?.startsWith("video"),
                      )
                      .map(
                        (m: MediaResponse) =>
                          ({
                            id: m.id,
                            url: `http://localhost:8080${m.url}`,
                            mimeType: m.mimeType || "",
                            fileName: m.originalName,
                          }) as MediaItem,
                      ),
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
                      {media.originalName || t("media.document")}
                    </span>
                  </span>
                </a>
              );
            })
          ) : (
            <p>{t("reportDetails.no-media-available")}</p>
          )}
        </div>
      </div>
      <MediaViewer viewer={viewer} />
    </div>
  );
}
