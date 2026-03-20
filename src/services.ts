import { AuthApi, Configuration, UserApi, type Middleware } from './api';
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
