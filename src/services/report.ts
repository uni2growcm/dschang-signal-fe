import { useQuery } from "@tanstack/react-query";
import { reportApi, getCategories } from "../services";
import type { Report } from "../api";
import { isAuth } from "../utils/utils";

export const useAuthenticatedUserReports = () => {
  return useQuery<Report[]>({
    queryKey: ["getAuthenticatedUserReports"],
    queryFn: async () => await reportApi.getMyReports(),
    enabled: isAuth(),
  });
};

export interface PublicReportsFilters {
  page?: number;
  size?: number;
  category?: string;
  status?: string;
}

export const usePublicReports = (filters: PublicReportsFilters = {}) => {
  const { page = 0, size = 10, category, status } = filters;

  return useQuery<Report[]>({
    queryKey: ["getPublicReports", page, size, category, status],
    queryFn: async () =>
      await reportApi.getPublicReports({
        page,
        size,
        ...(category ? { sort: category } : {}),
      }),
    placeholderData: (prev) => prev,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
};