import type { ErrorResponse } from '../api';
import { authApi } from '../services';
import { handleUnauthorized } from '../utils/handleUnauthorized';

export const logoutAPI = async () => {
  try {
    await authApi.logout();
  } catch (error: unknown) {
    if ((error as ErrorResponse).status === 401) {
      await handleUnauthorized();
    }
    throw error;
  }
};