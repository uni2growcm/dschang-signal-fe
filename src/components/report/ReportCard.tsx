import { Avatar, IconButton } from "@mui/material";
import { stringAvatar } from "../../utils/utils";
import { CiMenuKebab } from "react-icons/ci";
import type { Report } from "../../api";

export default function ReportCard({ report }: Readonly<{ report: Report }>) {
  const statusStyles: Record<Exclude<Report["reportStatus"], undefined>, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
};

  return (
    <div className="bg-white rounded-lg items-start shadow-md min-w-80 p-3 w-full">
      <div className="grid grid-cols-[1fr_auto] justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            {...stringAvatar(report.createdBy?.fullName || "")}
            className="font-semibold! max-sm:w-8! max-sm:h-8! text-sm!"
          />
          <div className="flex flex-col leading-none gap-0">
            <p className="text-lg max-sm:text-sm">{report.createdBy?.fullName}</p>
            <p className="text-sm max-sm:text-xs font-mono font-normal text-gray-500">{report.createdAt?.toDateString()}</p>
          </div>
        </div>
        <div className="flex gap-4 items-center ">
          <span
            className={`text-sm px-3 rounded-full border ${statusStyles[report.reportStatus!]}`}
          >
            {report.reportStatus!
              .split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ").toLocaleLowerCase().replaceAll(/\b\w/g, (char) => char.toUpperCase())}
          </span>
          <IconButton size="small">
            <CiMenuKebab />
          </IconButton>
        </div>
      </div>
      <h2 className="mb-2">{report.title}</h2>
      <p className="text-gray-700 mb-4 leading-none">{report.description}</p>
      <p className="text-sm text-gray-500 flex-1">{report.locationText}</p>
    </div>
  );
}
