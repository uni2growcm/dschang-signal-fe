import { useQuery } from "@tanstack/react-query";
import type { ErrorResponse, Report } from "../api";
import { reportApi, mediaApi } from "../services";
import { isAuth } from "../utils/utils";
import { handleUnauthorized } from "../utils/handleUnauthorized";
import { getCategoriesAPI } from "./category";

const PAGE_SIZE = 10;

export interface PaginatedReports {
  reports: Report[];
  totalPages: number;
  totalCount: number;
}

export interface PublicReportsFilters {
  page?: number;
  size?: number;
  enabled?: boolean;
}

export interface CategoriesFilters {
  enabled?: boolean;
}

const getTotalCount = (headerValue: string | null) => {
  const parsedValue = Number(headerValue ?? 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const useAuthenticatedUserReports = (page = 1, size = PAGE_SIZE, options: { enabled?: boolean } = {}) => {
    const { enabled = true } = options;
  return useQuery<PaginatedReports>({
    queryKey: ["getAuthenticatedUserReports", page, size],
    queryFn: async () => {
      const response = await reportApi.getMyReportsRaw({
        page: Math.max(page - 1, 0),
        size,
      });
      const reports = await response.value();
      const totalCount = getTotalCount(
        response.raw.headers.get("X-Total-Count"),
      );
      const totalPages = Math.max(1, Math.ceil(totalCount / size));

      return {
        reports,
        totalCount,
        totalPages,
      };
    },
    enabled: isAuth() && enabled,
  });
};

export const usePublicReports = (filters: PublicReportsFilters = {}) => {
  const { page = 1, size = PAGE_SIZE, enabled = true  } = filters;

  return useQuery<PaginatedReports>({
    queryKey: ["getPublicReports", page, size],
    queryFn: async () => {
      const response = await reportApi.getPublicReportsRaw({
        page: Math.max(page - 1, 0),
        size,
      });
      const reports = await response.value();
      const totalCount = getTotalCount(
        response.raw.headers.get("X-Total-Count"),
      );
      const totalPages = Math.max(1, Math.ceil(totalCount / size));

      return {
        reports,
        totalCount,
        totalPages,
      };
    },
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useCategories = (filters: CategoriesFilters = {}) => {
  const { enabled = true } = filters;

  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesAPI,
    enabled,
  });
};

export const useAllReports = (page: number, enabled: boolean = true) => {
  return useQuery<PaginatedReports>({
    queryKey: ["getAllReports", page],
    enabled,
    queryFn: () =>
      reportApi
        .getAllReportsRaw({ page: page - 1, size: PAGE_SIZE })
        .then(async (raw) => {
          const reports = await raw.value();
          const totalCount = Number(raw.raw.headers.get("X-Total-Count") ?? 0);
          const totalPages = Math.ceil(totalCount / PAGE_SIZE);
          return { reports, totalCount, totalPages };
        }),
  });
};

export const createReportAPI = async (data: {
  title: string;
  description: string;
  locationText: string;
  categoryIds: number[];
}) => {
  try {
    const response = await reportApi.createReport({ reportRequest: data });
    return response;
  } catch (error: unknown) {
    if ((error as ErrorResponse).status === 401) {
      await handleUnauthorized();
    }
    throw error;
  }
};

export const uploadMediaAPI = async (reportId: number, file: File) => {
  try {
    const response = await mediaApi.uploadMedia({
      reportId,
      file,
    });
    return response;
  } catch (error: unknown) {
    if ((error as ErrorResponse).status === 401) {
      await handleUnauthorized();
    }
    throw error;
  }
};

export const getReportByIdAPI = async (id: number) => {
  const [report, medias] = await Promise.all([
    reportApi.getReportById({ id }),
    mediaApi.getReportMedias({ reportId: id }),
  ]);
  return { ...report, medias };
};

export const deleteReportAPI = async (id: number): Promise<void> => {
  await reportApi.deleteReport({ id });
};

export const updateReportAPI = async (
  id: number,
  data: {
    title: string;
    description: string;
    locationText: string;
    categoryIds: number[];
  },
): Promise<void> => {
  await reportApi.updateReport({
    id,
    reportRequest: data,
  });
};

export const updateModerationStatusAPI = async (
  id: number,
  data: {
    status: "PENDING_REVIEW" | "ACCEPTED" | "REJECTED";
    rejectionReason?: string;
  },
) => {
  return await reportApi.updateModerationStatus({
    id,
    updateModerationStatusRequest: data,
  });
};

export const updateReportStatusAPI = async (
  id: number,
  data: {
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  },
) => {
    return await reportApi.updateReportStatus({
      id,
      updateReportStatusRequest: data,
    });
};


export const deleteMediaAPI = async (mediaId: number): Promise<void> => {
  await mediaApi.deleteMedia({ mediaId });
};

