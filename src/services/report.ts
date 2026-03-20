import { useQuery } from "@tanstack/react-query"
import { reportApi } from "../services"
import type { Report } from "../api"
import { isAuth } from "../utils/utils"


export const useAuthenticatedUserReports = () => {
    return useQuery<Report[]>({
        queryKey: ["getAuthenticatedUserReports"],
        queryFn: async () => await reportApi.getMyReports(),
        enabled: isAuth(),  
    })
}

export const usePublicReports = (page: number = 0, size: number = 10) => {
    return useQuery({
        queryKey: ['getPublicReports', page, size],
        queryFn: async () => await reportApi.getPublicReports({ page, size }),
        keepPreviousData: true,
    });
}