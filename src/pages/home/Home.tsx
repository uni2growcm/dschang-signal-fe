import { Backdrop, CircularProgress, Grow } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import ReportCard from "../../components/report/ReportCard";
import PaginationControls from "../../components/pagination/PaginationControls";
import SnackBar from "../../components/snackBar/SnackBar";
import { PATHS } from "../../routes/PATHS";
import {
  useAuthenticatedUserReports,
  useCategories,
  usePublicReports,
} from "../../services/report";
import { isAuth } from "../../utils/utils";

type FilterType = "public" | "mine";

type ReportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

type CategoryOption = {
  id: number;
  name: string;
};

const REPORT_STATUSES: ReportStatus[] = ["PENDING", "IN_PROGRESS", "RESOLVED"];
const PAGE_SIZE = 10;

const formatStatus = (status: ReportStatus) =>
  status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

export default function Home() {
  const authenticated = isAuth();
  const [showError, setShowError] = useState(false);
  const [filter, setFilter] = useState<FilterType>("public");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data: categories = [] } = useCategories();
  const {
    data: myReportsData,
    isLoading: privateLoading,
    isError: privateError,
  } = useAuthenticatedUserReports(page, PAGE_SIZE);
  const {
    data: publicReportsData,
    isLoading: publicLoading,
    isError: publicError,
  } = usePublicReports({ page, size: PAGE_SIZE });

  const isPublicView = !authenticated || filter === "public";
  const sourceReports = useMemo(() => {
    if (!authenticated) {
      return publicReportsData?.reports ?? [];
    }

    return filter === "mine"
      ? myReportsData?.reports ?? []
      : publicReportsData?.reports ?? [];
  }, [authenticated, filter, myReportsData, publicReportsData]);

  const displayedReports = useMemo(() => {
    return sourceReports.filter((report) => {
      const matchesCategory =
        selectedCategory === "" ||
        report.categories?.some((category) => category.name === selectedCategory);
      const matchesStatus =
        selectedStatus === "" || report.reportStatus === selectedStatus;

      return matchesCategory && matchesStatus;
    });
  }, [selectedCategory, selectedStatus, sourceReports]);

  const totalPages = useMemo(() => {
    if (!authenticated) {
      return publicReportsData?.totalPages ?? 1;
    }

    return filter === "mine"
      ? myReportsData?.totalPages ?? 1
      : publicReportsData?.totalPages ?? 1;
  }, [authenticated, filter, myReportsData, publicReportsData]);

  const isLoading = authenticated
    ? filter === "mine"
      ? privateLoading
      : publicLoading
    : publicLoading;
  const hasError = authenticated
    ? filter === "mine"
      ? privateError
      : publicError
    : publicError;
  const hasActiveFilters = selectedCategory !== "" || selectedStatus !== "";

  useEffect(() => {
    setPage(1);
  }, [filter, selectedCategory, selectedStatus]);

  useEffect(() => {
    if (!hasError) {
      setShowError(false);
      return;
    }

    setShowError(true);
  }, [hasError]);

  const handleFilterChange = (nextFilter: FilterType) => {
    setFilter(nextFilter);
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedStatus("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50">
        <Backdrop
          open
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <div className="flex flex-col items-center gap-4">
            <CircularProgress color="inherit" />
            <p className="text-white">Loading reports...</p>
          </div>
        </Backdrop>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50">
      <SnackBar
        open={showError}
        severity="error"
        message="Failed to load reports. Please refresh the page."
        onClose={() => setShowError(false)}
      />

      <Grow in timeout={1000}>
        <div className="container my-10 flex flex-col gap-5 max-lg:px-5">
          {authenticated && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleFilterChange("public")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    filter === "public"
                      ? "bg-primary text-white shadow"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("mine")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    filter === "mine"
                      ? "bg-primary text-white shadow"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  My reports
                </button>
              </div>

              <Link
                to={PATHS.CREATE_REPORT}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                + Create a Report
              </Link>
            </div>
          )}

          {isPublicView && (
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex min-w-[160px] flex-col gap-0.5">
                <label className="text-xs font-medium text-gray-400">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All categories</option>
                  {(categories as CategoryOption[]).map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-w-[140px] flex-col gap-0.5">
                <label className="text-xs font-medium text-gray-400">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All statuses</option>
                  {REPORT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-medium text-primary transition-all hover:underline"
                >
                  Clear filters
                </button>
              )}

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs text-primary">
                      {selectedCategory}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("")}
                        className="transition-colors hover:text-red-500"
                      >
                        x
                      </button>
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs text-primary">
                      {formatStatus(selectedStatus as ReportStatus)}
                      <button
                        type="button"
                        onClick={() => setSelectedStatus("")}
                        className="transition-colors hover:text-red-500"
                      >
                        x
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {displayedReports.length > 0 ? (
            displayedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-gray-500">
              <span className="text-4xl">No reports</span>
              <p className="font-medium">No reports found for this view.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-1 text-sm text-primary hover:underline"
                >
                  Clear filters to see all reports
                </button>
              )}
            </div>
          )}

          {!hasActiveFilters && displayedReports.length > 0 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
              onPrev={() => setPage((current) => Math.max(1, current - 1))}
            />
          )}
        </div>
      </Grow>
    </div>
  );
}
