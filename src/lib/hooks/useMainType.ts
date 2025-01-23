
import { mainTypeApi } from "@/api/mainTypeApi";
import { useQuery } from "@tanstack/react-query";
import { mainTypeQuery } from "../constants/queryNames";

export const useMainType = () => {
    const {
        data: mainTypeData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: [mainTypeQuery],
        queryFn: () => mainTypeApi.fetchMainType(),
        staleTime: 60000,
        refetchInterval: 60000,
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    });

    return {
        mainTypes: mainTypeData,
        isLoading,
        isError,
        error,
        refetch,
    }
}