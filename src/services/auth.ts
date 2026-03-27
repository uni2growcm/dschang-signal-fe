import { authApi } from '../services';
import { handleUnauthorized } from '../utils/handleUnauthorized';

export const logoutAPI = async () => {
  try {
    await authApi.logout();
  } catch (error: any) {
    if (error.status === 401) {
      await handleUnauthorized();
    }
    throw error;
  }
};