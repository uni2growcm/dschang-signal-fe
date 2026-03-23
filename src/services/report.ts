import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../services';
import type { Report } from '../api';
import { isAuth } from '../utils/utils';

const PAGE_SIZE = 5;

export interface PaginatedReports {
  reports: Report[];
  totalPages: number;
  totalCount: number;
}

export const useAuthenticatedUserReports = (page: number) => {
  return useQuery<PaginatedReports>({
    queryKey: ['getAuthenticatedUserReports', page],
    queryFn: () =>
      reportApi
        .getMyReportsRaw({ page: page - 1, size: PAGE_SIZE })
        .then(async (raw) => {
          const reports = await raw.value();
          const totalCount = Number(raw.raw.headers.get('X-Total-Count') ?? 0);
          const totalPages = Math.ceil(totalCount / PAGE_SIZE);
          return { reports, totalPages, totalCount };
        }),
    enabled: isAuth(),
  });
};

export const usePublicReports = (page: number) => {
  return useQuery<PaginatedReports>({
    queryKey: ['getPublicReports', page],
    queryFn: () =>
      reportApi
        .getPublicReportsRaw({ page: page - 1, size: PAGE_SIZE })
        .then(async (raw) => {
          const reports = await raw.value();
          const totalCount = Number(raw.raw.headers.get('X-Total-Count') ?? 0);
          const totalPages = Math.ceil(totalCount / PAGE_SIZE);
          return { reports, totalPages, totalCount };
        }),
  });
};
