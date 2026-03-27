import {
  AuthApi,
  ReportApi,
  CategoryApi,
  MediaApi,
  UserApi,
  Configuration,
  type Middleware,
} from "./api";
import { API_URL } from "./utils/env";
import { getToken } from "./utils/localStorage";
import { handleUnauthorized } from "./utils/handleUnauthorized";
import i18n from "./i18n/i18n";

const addTokenToHeadersMiddleware: Middleware = {
  pre: async (request) => {
    const token = getToken();
    request.init.headers = {
      ...request.init.headers,
      "Accept-Language": i18n.language,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  post: async (context) => {
    const isAuthEndpoint =
      context.url.includes("/logout") || context.url.includes("/login");

    if (context.response.status >= 400) {
      let errorMessage = "Une erreur est survenue";

      try {
        const errorBody = await context.response.clone().json();
        if (errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch {
        try {
          errorMessage = await context.response.clone().text();
        } catch (error) {
          console.error("Failed to parse error response:", error);
        }
      }

      if (context.response.status === 401 && !isAuthEndpoint) {
        await handleUnauthorized();
      }

      throw new Error(errorMessage);
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

export {
  createReportAPI as createReport,
  uploadMediaAPI as uploadMedia,
  getReportByIdAPI as getReportById,
  deleteReportAPI as deleteReport,
  updateReportAPI as updateReport,
  deleteMediaAPI as deleteMedia,
  updateModerationStatusAPI as updateModerationStatus,
  updateReportStatusAPI as updateReportStatus
} from "./services/report";

export {
  getCategoriesAPI as getCategories,
  createCategoryAPI as createCategory,
  checkCategoryExistsAPI as checkCategoryExists,
} from "./services/category";

export { logoutAPI as logout } from "./services/auth";
