import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { CiMenuKebab } from "react-icons/ci";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Report } from "../../api";
import { PATHS } from "../../routes/PATHS";
import { stringAvatar } from "../../utils/utils";
import { deleteReport } from "../../services";
import { useMe } from "../../services/user";

const formatStatus = (status: NonNullable<Report["reportStatus"]>) =>
  status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

export default function ReportCard({ report }: Readonly<{ report: Report }>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: currentUser } = useMe();

  const isOwner = currentUser?.id === report.createdBy?.id;
  const canEdit =
    isOwner &&
    report.moderationStatus === "PENDING_REVIEW" &&
    report.reportStatus === "PENDING";
  const canDelete = isOwner && report.reportStatus === "PENDING";

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (report.id) {
      navigate(PATHS.EDIT_REPORT.replace(":id", String(report.id)));
    }
  };

  const handleDelete = () => {
    handleMenuClose();
    if (!report.id) return;
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!report.id) return;
    deleteReport(report.id)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["getAuthenticatedUserReports"],
        });
        queryClient.invalidateQueries({ queryKey: ["getPublicReports"] });
        setDeleteDialogOpen(false);
      })
      .catch(console.error);
  };

  const handleShare = () => {
    handleMenuClose();
    if (!report.id) return;

    const url = `${window.location.origin}${PATHS.REPORT_DETAILS.replace(
      ":id",
      String(report.id),
    )}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert(
          t("reportCard.shareCopied", "Lien copié dans le presse-papier !"),
        );
      })
      .catch(console.error);
  };

  const statusStyles: Record<
    Exclude<Report["reportStatus"], undefined>,
    string
  > = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    RESOLVED: "bg-green-100 text-green-700",
  };

  const moderationStyles: Record<
    "PENDING_REVIEW" | "ACCEPTED" | "REJECTED",
    string
  > = {
    PENDING_REVIEW: "bg-gray-100 text-gray-700",
    ACCEPTED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const getTranslatedStatusLabel = (
    status: NonNullable<Report["reportStatus"]>,
  ) => {
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
    status: "PENDING_REVIEW" | "ACCEPTED" | "REJECTED",
  ) => {
    switch (status) {
      case "PENDING_REVIEW":
        return t("home.moderationPendingReview");
      case "ACCEPTED":
        return t("home.moderationAccepted");
      case "REJECTED":
        return t("home.moderationRejected");
      default:
        return status;
    }
  };

  const isRejected = report.moderationStatus === "REJECTED";
  const showModerationBadge =
    report.moderationStatus === "REJECTED" ||
    report.moderationStatus === "PENDING_REVIEW";

  return (
    <div className="min-w-80 w-full items-start rounded-lg bg-white p-3 shadow-md">
      <div className="mb-4 grid grid-cols-[1fr_auto] items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            {...stringAvatar(report.createdBy?.fullName || "")}
            className="font-semibold! max-sm:w-8! max-sm:h-8! text-sm!"
          />
          <div className="flex flex-col gap-0 leading-none">
            <p className="text-lg max-sm:text-sm">
              {report.createdBy?.fullName}
            </p>
            <p className="text-sm font-mono font-normal text-gray-500 max-sm:text-xs">
              {report.createdAt?.toDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showModerationBadge && report.moderationStatus ? (
            <span
              className={`rounded-full border px-3 text-sm ${
                moderationStyles[report.moderationStatus]
              }`}
            >
              {getTranslatedModerationStatusLabel(report.moderationStatus)}
            </span>
          ) : report.reportStatus ? (
            <span
              className={`rounded-full border px-3 text-sm ${
                statusStyles[report.reportStatus]
              }`}
            >
              {getTranslatedStatusLabel(report.reportStatus)}
            </span>
          ) : null}

          <IconButton size="small" onClick={handleMenuOpen}>
            <CiMenuKebab />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleShare}>
              {t("reportCard.share", "Partager")}
            </MenuItem>
            {canEdit && (
              <MenuItem onClick={handleEdit}>
                {t("reportCard.edit", "Modifier")}
              </MenuItem>
            )}
            {canDelete && (
              <MenuItem onClick={handleDelete}>
                {t("reportCard.delete", "Supprimer")}
              </MenuItem>
            )}
          </Menu>
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>
              {t("reportDetails.deleteTitle", "Delete Report")}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {t(
                  "reportDetails.deleteMessage",
                  "Are you sure you want to delete this report? This action cannot be undone.",
                )}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
              >
                {t("reportDetails.no", "No")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                {t("reportDetails.yesDelete", "Yes, Delete")}
              </button>
            </DialogActions>
          </Dialog>
        </div>
      </div>

      <h2 className="mb-2">{report.title}</h2>
      <p className="mb-4 leading-none text-gray-700">{report.description}</p>

      {isRejected && report.rejectionReason && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          <span className="font-medium">
            {t("reportDetails.rejectionReason")}:
          </span>{" "}
          {report.rejectionReason}
        </div>
      )}

      <p className="text-sm text-gray-500">{report.locationText}</p>

      <div className="mt-3 flex justify-end">
        <Link
          to={
            report.id
              ? PATHS.REPORT_DETAILS.replace(":id", String(report.id))
              : "#"
          }
          className="text-sm font-semibold text-primary hover:underline"
        >
          {t("report.viewDetails")}
        </Link>
      </div>
    </div>
  );
}
