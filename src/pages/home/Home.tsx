import { Backdrop, CircularProgress, Grow } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/header/Header";
import ReportCard from "../../components/report/ReportCard";
import { isAuth } from "../../utils/utils";
import {
  useAuthenticatedUserReports,
  usePublicReports,
} from "../../services/report";
import SnackBar from "../../components/snackBar/SnackBar";

type FilterType = "public" | "mine";

export default function Home() {
  const [showError, setShowError] = useState(false);
  const [filter, setFilter] = useState<FilterType>("public");

  const {
    data: myReports = [],
    isLoading: privateLoading,
    isError: privateError,
  } = useAuthenticatedUserReports();

  const {
    data: publicReports = [],
    isLoading: publicLoading,
    isError: publicError,
  } = usePublicReports();

  const isLoading = privateLoading || publicLoading;
  const hasError = privateError || publicError;

  const displayedReports = useMemo(() => {
    if (!isAuth()) return publicReports;
    return filter === "mine" ? myReports : publicReports;
  }, [filter, myReports, publicReports]);

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

          {/* Toggle filtre — visible seulement si connecté */}
          {isAuth() && (
            <div className="flex gap-2 self-start bg-white rounded-full shadow-sm p-1 border border-gray-200">
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
          )}

          {displayedReports.length > 0 ? (
            displayedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              Aucun signalement trouvé
            </div>
          )}
        </div>
      </Grow>
    </div>
  );
}