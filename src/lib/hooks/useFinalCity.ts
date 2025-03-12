import { useQuery } from "@tanstack/react-query";
import { FinalCityType } from "@/lib/types/index";
import { finalCityQuery,  } from "../constants/queryNames";
import { finalCityApi } from "@/api/finalCityApi";

export const useFinalCities = () => {
    const {
        data: finalCities,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery<FinalCityType[]>({
        queryKey: [finalCityQuery],
        queryFn: () => finalCityApi.fetchFinalCity(),
        staleTime: 60000,
        refetchInterval: 60000,
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    });

    return {
        finalCities: finalCities,
        isLoading,
        isError,
        error,
        refetch,
    };
};
