import {
  AuthApi,
  CategoryApi,
  Configuration,
  MediaApi,
  ReportApi,
  UserApi,
  type Middleware,
} from "./api";
import i18n from "./i18n/i18n";
import { API_URL } from "./utils/env";
import { handleUnauthorized } from "./utils/handleUnauthorized";
import { getToken } from "./utils/localStorage";

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

export const googleLogin = async (token: string) => {
  const response = await fetch(`${API_URL.dev}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Google login failed");
  }

  return response.json();
};

export {
  createReportAPI as createReport,
  deleteMediaAPI as deleteMedia,
  deleteReportAPI as deleteReport,
  getReportByIdAPI as getReportById,
  updateModerationStatusAPI as updateModerationStatus,
  updateReportAPI as updateReport,
  updateReportStatusAPI as updateReportStatus,
  uploadMediaAPI as uploadMedia,
  usePublicReportById,
} from "./services/report";

export {
  checkCategoryExistsAPI as checkCategoryExists,
  createCategoryAPI as createCategory,
  getCategoriesAPI as getCategories,
} from "./services/category";

export interface DailyReportQuota {
  dailyLimit: number | null;
  createdToday: number | null;
  remainingToday: number | null;
  hasRecognizedFields: boolean;
}

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
};

const pickFirstNumber = (
  source: Record<string, unknown>,
  keys: string[],
): number | null => {
  for (const key of keys) {
    const value = toNullableNumber(source[key]);
    if (value !== null) {
      return value;
    }
  }

  return null;
};

export const getDailyReportQuota = async (): Promise<DailyReportQuota> => {
  const token = getToken();

  if (!token) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${API_URL.dev}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    await handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch daily report quota");
  }

  const payload = (await response.json()) as Record<string, unknown>;

  const dailyLimit = pickFirstNumber(payload, [
    "dailyReportLimit",
    "maxDailyReports",
    "maxReportsPerDay",
    "reportLimitPerDay",
    "reportsPerDayLimit",
    "dailyLimit",
  ]);
  const createdToday = pickFirstNumber(payload, [
    "reportsCreatedToday",
    "createdReportsToday",
    "dailyReportsCreated",
    "todayReportsCount",
    "reportCountToday",
    "reportsToday",
  ]);
  let remainingToday = pickFirstNumber(payload, [
    "remainingReportsToday",
    "remainingDailyReports",
    "dailyReportsRemaining",
    "reportsRemainingToday",
    "remainingReports",
    "remaining",
  ]);

  if (remainingToday === null && dailyLimit !== null && createdToday !== null) {
    remainingToday = Math.max(dailyLimit - createdToday, 0);
  }

  const normalizedCreatedToday =
    createdToday === null && dailyLimit !== null && remainingToday !== null
      ? Math.max(dailyLimit - remainingToday, 0)
      : createdToday;

  return {
    dailyLimit,
    createdToday: normalizedCreatedToday,
    remainingToday,
    hasRecognizedFields:
      dailyLimit !== null ||
      normalizedCreatedToday !== null ||
      remainingToday !== null,
  };
};

export { logoutAPI as logout } from "./services/auth";
