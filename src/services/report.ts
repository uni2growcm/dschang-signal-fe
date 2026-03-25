import { useQuery } from "@tanstack/react-query";
import type { Report } from "../api";
import { getCategories, reportApi } from "../services";
import { isAuth } from "../utils/utils";

const PAGE_SIZE = 10;

export interface PaginatedReports {
  reports: Report[];
  totalPages: number;
  totalCount: number;
}

export interface PublicReportsFilters {
  page?: number;
  size?: number;
}

export interface CategoriesFilters {
  enabled?: boolean;
}

const getTotalCount = (headerValue: string | null) => {
  const parsedValue = Number(headerValue ?? 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const useAuthenticatedUserReports = (page = 1, size = PAGE_SIZE) => {
  return useQuery<PaginatedReports>({
    queryKey: ["getAuthenticatedUserReports", page, size],
    queryFn: async () => {
      const response = await reportApi.getMyReportsRaw({
        page: Math.max(page - 1, 0),
        size,
      });
      const reports = await response.value();
      const totalCount = getTotalCount(response.raw.headers.get("X-Total-Count"));
      const totalPages = Math.max(1, Math.ceil(totalCount / size));

      return {
        reports,
        totalCount,
        totalPages,
      };
    },
    enabled: isAuth(),
  });
};

export const usePublicReports = (filters: PublicReportsFilters = {}) => {
  const { page = 1, size = PAGE_SIZE } = filters;

  return useQuery<PaginatedReports>({
    queryKey: ["getPublicReports", page, size],
    queryFn: async () => {
      const response = await reportApi.getPublicReportsRaw({
        page: Math.max(page - 1, 0),
        size,
      });
      const reports = await response.value();
      const totalCount = getTotalCount(response.raw.headers.get("X-Total-Count"));
      const totalPages = Math.max(1, Math.ceil(totalCount / size));

      return {
        reports,
        totalCount,
        totalPages,
      };
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCategories = (filters: CategoriesFilters = {}) => {
  const { enabled = true } = filters;

  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled,
  });
};

export const useAllReports = (page: number) =>{
  return useQuery<PaginatedReports>({
    queryKey: ['getAllReports', page],
    queryFn: () =>
      reportApi
        .getAllReportsRaw({page: page -1, size: PAGE_SIZE})
        .then(async (raw) =>{
          const reports = await raw.value()
          const totalCount = Number(raw.raw.headers.get('X-Total-Count') ?? 0)
          const totalPages = Math.ceil(totalCount/PAGE_SIZE)
          return {reports, totalCount, totalPages}
        })
  })
}

