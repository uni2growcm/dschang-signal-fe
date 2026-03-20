import { useQuery } from "@tanstack/react-query";
import { userApi } from "../services";
import type { User } from "../api";
import { isAuth } from "../utils/utils";

export const useMe = () => {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => await userApi.getCurrentUser(),
    enabled: isAuth(),
  });
};
