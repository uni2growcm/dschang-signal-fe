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
import { LOCAL_STORAGE_KEYS } from './utils/localStorage';

const addTokenToHeadersMiddleware: Middleware = {
  pre: async (request) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token) {
      request.init.headers = {
        ...request.init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
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
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  
  
  if (!token) {
    const response = await fetch(`${API_URL.dev}/reports/public/${id}`);
    if (!response.ok) {
      throw new Error('Report not found or not public');
    }
    const report = await response.json();
   
    return { ...report, medias: [] };
  }
  
  
  const [report, medias] = await Promise.all([
    reportApi.getReportById({ id }),
    mediaApi.getReportMedias({ reportId: id })
  ]);
  return { ...report, medias };
};

export const createReport = async (data: {
  title: string;
  description: string;
  locationText: string;
  categoryIds: number[];
}) => {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  const response = await fetch(`${API_URL.dev}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create report');
  }
  return response.json();
};

export const uploadMedia = async (reportId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  const response = await fetch(`${API_URL.dev}/reports/${reportId}/media`, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Media upload failed');
  return response.json();
};

export const getCategories = async () => {
  return await categoryApi.getAllCategories();
};

export const createCategory = async (name: string) => {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
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
  if (!response.ok) throw new Error('Category creation failed');
  return response.json();
};

export const checkCategoryExists = async (name: string): Promise<boolean> => {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  const categories = await fetch(`${API_URL.dev}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
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
