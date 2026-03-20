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

export const usePublicReports = () => {
    return useQuery({
        queryKey: ['getPublicReports'],
        queryFn: async () => await reportApi.getPublicReports(),
    })
}