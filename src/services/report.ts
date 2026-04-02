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
  status?: string;
  category?: string;
}

export interface CategoriesFilters {
  enabled?: boolean;
}

export interface AuthenticatedReportsFilters {
  page?: number;
  size?: number;
  enabled?: boolean;
  status?: string;
  category?: string;
}

const getTotalCount = (headerValue: string | null) => {
  const parsedValue = Number(headerValue ?? 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const getAllAuthenticatedUserReportsAPI = async (
  size = 100,
): Promise<Report[]> => {
  const reports: Report[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const response = await reportApi.getMyReportsRaw({
      page,
      size,
    });
    const pageReports = await response.value();

    reports.push(...pageReports);

    const totalCount = getTotalCount(
      response.raw.headers.get("X-Total-Count"),
    );
    totalPages = Math.max(1, Math.ceil(totalCount / size));
    page += 1;
  }

  return reports;
};

export const useAuthenticatedUserReports = (
  filters: AuthenticatedReportsFilters = {},
) => {
  const {
    page = 1,
    size = PAGE_SIZE,
    enabled = true,
    status,
    category,
  } = filters;

  return useQuery<PaginatedReports>({
    queryKey: ["getAuthenticatedUserReports", page, size, status, category],
    queryFn: async () => {
      const response = await reportApi.getMyReportsRaw({
        page: Math.max(page - 1, 0),
        size,
        ...(status ? { status: status as any } : {}),
        ...(category ? { category } : {}),
      });
      const reports = await response.value();
      const totalCount = getTotalCount(
        response.raw.headers.get("X-Total-Count"),
      );
      const totalPages = Math.max(1, Math.ceil(totalCount / size));

      return { reports, totalCount, totalPages };
    },
    enabled: enabled && isAuth(),
  });
};

export const usePublicReports = (filters: PublicReportsFilters = {}) => {
  const { page = 1, size = PAGE_SIZE, status, category } = filters;

  return useQuery<PaginatedReports>({
    queryKey: ["getPublicReports", page, size, status, category],
    queryFn: async () => {
      const response = await reportApi.getPublicReportsRaw({
        page: Math.max(page - 1, 0),
        size,
        ...(status ? { status: status as any } : {}),
        ...(category ? { category } : {}),
      });
      const reports = await response.value();
      const totalCount = getTotalCount(
        response.raw.headers.get("X-Total-Count"),
      );
      const totalPages = Math.max(1, Math.ceil(totalCount / size));

      return { reports, totalCount, totalPages };
    },
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

export interface AdminReportsFilters {
  page?: number;
  size?: number;
  enabled?: boolean;
  moderationStatus?: string;
  reportStatus?: string;
  category?: string;
}

export const useAllReports = (filters: AdminReportsFilters = {}) => {
  const {
    page = 1,
    size = PAGE_SIZE,
    enabled = true,
    moderationStatus,
    reportStatus,
    category,
  } = filters;
  return useQuery<PaginatedReports>({
    queryKey: [
      "getAllReports",
      page,
      size,
      moderationStatus,
      reportStatus,
      category,
    ],
    enabled,
    queryFn: async () => {
      const raw = await reportApi.getAllReportsRaw({
        page: page - 1,
        size,
        ...(moderationStatus
          ? { moderationStatus: moderationStatus as any }
          : {}),
        ...(reportStatus ? { reportStatus: reportStatus as any } : {}),
        ...(category ? { category } : {}),
      });
      const reports = await raw.value();
      const totalCount = Number(raw.raw.headers.get("X-Total-Count") ?? 0);
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      return { reports, totalCount, totalPages };
    },
  });
};

export const usePublicReportById = (id: number | null) => {
  return useQuery<Report & { medias?: any[] }>({
    queryKey: ["getPublicReportById", id],
    queryFn: async () => {
      if (!id) throw new Error("Report ID is required");

      const report = await reportApi.getPublicReportById({ id });

      return { ...report, medias: [] };
    },
    enabled: !!id,
    retry: false,
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
