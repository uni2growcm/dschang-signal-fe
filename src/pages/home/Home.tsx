import { Backdrop, CircularProgress, Grow } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Header from "../../components/header/Header";
import ReportCard from "../../components/report/ReportCard";
import { isAuth } from "../../utils/utils";
import {
  useAuthenticatedUserReports,
  usePublicReports,
  useCategories,
} from "../../services/report";
import SnackBar from "../../components/snackBar/SnackBar";
import { PATHS } from "../../routes/PATHS";

type FilterType = "public" | "mine";

const REPORT_STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED"] as const;
const PAGE_SIZE = 10;

export default function Home() {
  const [showError, setShowError] = useState(false);
  const [filter, setFilter] = useState<FilterType>("public");

  // Pagination
  const [page, setPage] = useState(0);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data: categories = [] } = useCategories();

  const {
    data: myReports = [],
    isLoading: privateLoading,
    isError: privateError,
  } = useAuthenticatedUserReports();

  const {
    data: publicReports = [],
    isLoading: publicLoading,
    isError: publicError,
  } = usePublicReports({
    page,
    size: PAGE_SIZE,
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
  });

  const isLoading = privateLoading || publicLoading;
  const hasError = privateError || publicError;

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [selectedCategory, selectedStatus, filter]);

  const displayedReports = useMemo(() => {
    if (!isAuth()) return publicReports;
    return filter === "mine" ? myReports : publicReports;
  }, [filter, myReports, publicReports]);

  const isPublicView = !isAuth() || filter === "public";
  const hasNextPage = publicReports.length === PAGE_SIZE;

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedStatus("");
    setPage(0);
  };

  const hasActiveFilters = selectedCategory !== "" || selectedStatus !== "";

  useEffect(() => {
    if (hasError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50">
        <Header />
        <Backdrop
          open={true}
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <div className="flex flex-col items-center gap-4">
            <CircularProgress color="inherit" />
            <p className="text-white">Chargement des signalements...</p>
          </div>
        </Backdrop>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50">
      <Header />
      <SnackBar
        open={showError}
        severity="error"
        message="Échec du chargement des signalements. Veuillez recharger la page."
      />
      <Grow in timeout={1000}>
        <div className="container flex flex-col gap-5 my-10 max-lg:px-5">

          {/* ── Top bar: Public/Mine toggle + Create button ── */}
          {isAuth() && (
            <div className="flex justify-between items-center">
              <div className="flex gap-2 bg-white rounded-full shadow-sm p-1 border border-gray-200">
                <button
                  onClick={() => setFilter("public")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    filter === "public"
                      ? "bg-primary text-white shadow"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setFilter("mine")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    filter === "mine"
                      ? "bg-primary text-white shadow"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Mes signalements
                </button>
              </div>
              <Link
                to={PATHS.CREATE_REPORT}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all"
              >
                + Create a Report
              </Link>
            </div>
          )}

          {/* ── Filters (public view only) ── */}
          {isPublicView && (
            <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
              {/* Category filter */}
              <div className="flex flex-col gap-0.5 min-w-[160px]">
                <label className="text-xs text-gray-400 font-medium">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="">All categories</option>
                  {(categories as Array<{ id: number; name: string }>).map(
                    (cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Status filter */}
              <div className="flex flex-col gap-0.5 min-w-[140px]">
                <label className="text-xs text-gray-400 font-medium">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="">All statuses</option>
                  {REPORT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear filters button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-xs text-primary font-medium hover:underline transition-all"
                >
                  Clear filters
                </button>
              )}

              {/* Active filter badges */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedCategory && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-primary text-xs rounded-full border border-purple-100">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("")}
                        className="hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-primary text-xs rounded-full border border-purple-100">
                      {selectedStatus.replace("_", " ")}
                      <button
                        onClick={() => setSelectedStatus("")}
                        className="hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Report list ── */}
          {displayedReports.length > 0 ? (
            displayedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <div className="text-center text-gray-500 py-16 flex flex-col items-center gap-2">
              <span className="text-4xl">🔍</span>
              <p className="font-medium">Aucun signalement trouvé</p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary hover:underline mt-1"
                >
                  Clear filters to see all reports
                </button>
              )}
            </div>
          )}

          {/* ── Pagination (public view only) ── */}
          {isPublicView && (
            <div className="flex justify-center items-center gap-4 mt-4 pb-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                  page === 0
                    ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-primary text-primary hover:bg-primary hover:text-white"
                }`}
              >
                ← Previous
              </button>

              <span className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                Page {page + 1}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNextPage}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                  !hasNextPage
                    ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-primary text-primary hover:bg-primary hover:text-white"
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </Grow>
    </div>
  );
}