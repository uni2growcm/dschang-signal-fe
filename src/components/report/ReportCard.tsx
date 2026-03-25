import { Avatar, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CiMenuKebab } from "react-icons/ci";
import { Link } from "react-router";
import type { Report } from "../../api";
import { PATHS } from "../../routes/PATHS";
import { stringAvatar } from "../../utils/utils";

const formatStatus = (status: NonNullable<Report["reportStatus"]>) =>
  status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

export default function ReportCard({ report }: Readonly<{ report: Report }>) {
  const { t } = useTranslation();
  const statusStyles: Record<Exclude<Report["reportStatus"], undefined>, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    RESOLVED: "bg-green-100 text-green-700",
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

  return (
    <div className="min-w-80 w-full items-start rounded-lg bg-white p-3 shadow-md">
      <div className="mb-4 grid grid-cols-[1fr_auto] items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            {...stringAvatar(report.createdBy?.fullName || "")}
            className="font-semibold! max-sm:w-8! max-sm:h-8! text-sm!"
          />
          <div className="flex flex-col gap-0 leading-none">
            <p className="text-lg max-sm:text-sm">{report.createdBy?.fullName}</p>
            <p className="text-sm font-mono font-normal text-gray-500 max-sm:text-xs">
              {report.createdAt?.toDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {report.reportStatus && (
            <span className={`rounded-full border px-3 text-sm ${statusStyles[report.reportStatus]}`}>
              {getTranslatedStatusLabel(report.reportStatus)}
            </span>
          )}
          <IconButton size="small">
            <CiMenuKebab />
          </IconButton>
        </div>
      </div>
      <h2 className="mb-2">{report.title}</h2>
      <p className="mb-4 leading-none text-gray-700">{report.description}</p>
      <p className="text-sm text-gray-500">{report.locationText}</p>
      <div className="mt-3 flex justify-end">
        <Link
          to={PATHS.REPORT_DETAILS.replace(":id", String(report.id))}
          className="text-sm font-semibold text-primary hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
