import {
  AuthApi,
  ReportApi,
  CategoryApi,
  MediaApi,
  UserApi,
  Configuration,
  type Middleware,
} from './api';
import { API_URL } from './utils/env';
import { getToken } from './utils/localStorage';
import { handleUnauthorized } from './utils/handleUnauthorized';

const addTokenToHeadersMiddleware: Middleware = {
  pre: async (request) => {
    const token = getToken();
    if (token) {
      request.init.headers = {
        ...request.init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  },

post: async (context) => {
  const isAuthEndpoint =
    context.url.includes('/logout') ||
    context.url.includes('/login');
  if (context.response.status === 401 && !isAuthEndpoint) {
    await handleUnauthorized();
  }
  return context.response;
},
};

const apiConfig = new Configuration({
  basePath: API_URL.dev,
  middleware: [addTokenToHeadersMiddleware],
});

export const authApi = new AuthApi(apiConfig);
export const userApi = new UserApi(apiConfig);
export const reportApi = new ReportApi(apiConfig);
export const categoryApi = new CategoryApi(apiConfig);
export const mediaApi = new MediaApi(apiConfig);

export const getReportById = async (id: number) => {
  const token = getToken();

  if (!token) {
    try {
      const response = await fetch(`${API_URL.dev}/reports/public/${id}`);
      if (response.status === 404) throw new Error('REPORT_NOT_FOUND');
      if (!response.ok) throw new Error('Failed to fetch public report');
      const report = await response.json();
      return { ...report, medias: [] };
    } catch (error) {
      console.error('Error fetching public report:', error);
      throw error;
    }
  }

  try {
    const [report, medias] = await Promise.all([
      reportApi.getReportById({ id }),
      mediaApi.getReportMedias({ reportId: id }),
    ]);
    return { ...report, medias };
  } catch (error) {
    console.error('Error fetching private report:', error);
    throw new Error('Failed to fetch report details');
  }
};

export const createReport = async (data: {
  title: string;
  description: string;
  locationText: string;
  categoryIds: number[];
}) => {
  const token = getToken();
  const response = await fetch(`${API_URL.dev}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (response.status === 401) {
    await handleUnauthorized();
    return;
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create report');
  }
  return response.json();
};

export const uploadMedia = async (reportId: number, file: File) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL.dev}/reports/${reportId}/media`, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) {
    await handleUnauthorized();
    return;
  }
  if (!response.ok) throw new Error('Media upload failed');
  return response.json();
};

export const getCategories = async () => {
  return await categoryApi.getAllCategories();
};

export const createCategory = async (name: string) => {
  const token = getToken();
  const normalizedName =
    name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
  const response = await fetch(`${API_URL.dev}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: normalizedName }),
  });
  if (response.status === 401) {
    await handleUnauthorized();
    return;
  }
  if (!response.ok) throw new Error('Category creation failed');
  return response.json();
};

export const checkCategoryExists = async (name: string): Promise<boolean> => {
  const token = getToken();
  const response = await fetch(`${API_URL.dev}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) {
    await handleUnauthorized();
    return false;
  }
  const categories = await response.json();
  return categories.some(
    (cat: any) => cat.name.toLowerCase() === name.toLowerCase(),
  );
};

export const deleteReport = async (id: number): Promise<void> => {
  await reportApi.deleteReport({ id });
};

export const deleteMedia = async (mediaId: number): Promise<void> => {
  await mediaApi.deleteMedia({ mediaId });
};

export const updateReport = async (
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

export const updateModerationStatus = async (
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

export const updateReportStatus = async (
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
