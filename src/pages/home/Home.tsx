import { Backdrop, CircularProgress, Grow } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import ReportCard from '../../components/report/ReportCard';
import PaginationControls from '../../components/pagination/PaginationControls';
import { isAuth } from '../../utils/utils';
import {
  useAuthenticatedUserReports,
  usePublicReports,
} from '../../services/report';
import SnackBar from '../../components/snackBar/SnackBar';
import { PATHS } from '../../routes/PATHS';

type FilterType = 'public' | 'mine';

export default function Home() {
  const [showError, setShowError] = useState(false);
  const [filter, setFilter] = useState<FilterType>('public');
  const [page, setPage] = useState(1);

  const {
    data: myReportsData,
    isLoading: privateLoading,
    isError: privateError,
  } = useAuthenticatedUserReports(page);

  const {
    data: publicReportsData,
    isLoading: publicLoading,
    isError: publicError,
  } = usePublicReports(page);

  const isLoading = privateLoading || publicLoading;
  const hasError = privateError || publicError;

  const displayedReports = useMemo(() => {
    if (!isAuth()) return publicReportsData?.reports ?? [];
    return filter === 'mine'
      ? (myReportsData?.reports ?? [])
      : (publicReportsData?.reports ?? []);
  }, [filter, myReportsData, publicReportsData]);

  const totalPages = useMemo(() => {
    if (!isAuth()) return publicReportsData?.totalPages ?? 0;
    return filter === 'mine'
      ? (myReportsData?.totalPages ?? 0)
      : (publicReportsData?.totalPages ?? 0);
  }, [filter, myReportsData, publicReportsData]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
  };

  useEffect(() => {
    if (!hasError) return;
    const timer = setTimeout(() => {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }, 0);
    return () => clearTimeout(timer);
  }, [hasError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50">

        <Backdrop
          open={true}
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
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
      <SnackBar
        open={showError}
        severity="error"
        message="Échec du chargement des signalements. Veuillez recharger la page."
      />
      <Grow in timeout={1000}>
        <div className="container flex flex-col gap-5 my-10 max-lg:px-5">
          {isAuth() && (
            <div className="flex justify-between items-center">
              <div className="flex gap-2 bg-white rounded-full shadow-sm p-1 border border-gray-200">
                <button
                  onClick={() => handleFilterChange('public')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    filter === 'public'
                      ? 'bg-primary text-white shadow'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => handleFilterChange('mine')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    filter === 'mine'
                      ? 'bg-primary text-white shadow'
                      : 'text-gray-500 hover:text-gray-800'
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
          {displayedReports.length > 0 ? (
            displayedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              Aucun signalement trouvé
            </div>
          )}
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onNext={() => setPage((p) => p + 1)}
            onPrev={() => setPage((p) => p - 1)}
          />
        </div>
      </Grow>
    </div>
  );
}
